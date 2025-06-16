import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Anomaly, AnomalyType, AnomalySeverity, AnomalyStatus } from './entities/anomaly.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { AIService } from '../chat/services/ai.service';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { AttendanceStatus } from '../attendance/entities/attendance.entity';
import { DailyAttendance } from '../attendance/types/attendance.types';
import { Document } from '../chat/entities/document.entity';
import { GetAnomaliesDto } from './dto/get-anomalies.dto';

interface AnomalyAnalysis {
  anomalies: Array<{
    type: AnomalyType;
    severity: AnomalySeverity;
    description: string;
    details: {
      metrics: Record<string, number>;
      recommendations: string[];
    };
  }>;
}

@Injectable()
export class AnomaliesService {
  private readonly logger = new Logger(AnomaliesService.name);

  constructor(
    @InjectRepository(Anomaly)
    private anomalyRepository: Repository<Anomaly>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private attendanceService: AttendanceService,
    private aiService: AIService
  ) {}

  async getAnomalies(query: GetAnomaliesDto) {
    const { page = 1, limit = 10, type, severity, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [anomalies, total] = await this.anomalyRepository.findAndCount({
      where,
      relations: ['user', 'resolvedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      data: anomalies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAnomalyStats() {
    const [total, byType, bySeverity, byStatus] = await Promise.all([
      this.anomalyRepository.count(),
      this.anomalyRepository
        .createQueryBuilder('anomaly')
        .select('anomaly.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('anomaly.type')
        .getRawMany(),
      this.anomalyRepository
        .createQueryBuilder('anomaly')
        .select('anomaly.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('anomaly.severity')
        .getRawMany(),
      this.anomalyRepository
        .createQueryBuilder('anomaly')
        .select('anomaly.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('anomaly.status')
        .getRawMany()
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map(({ type, count }) => [type, parseInt(count)])),
      bySeverity: Object.fromEntries(bySeverity.map(({ severity, count }) => [severity, parseInt(count)])),
      byStatus: Object.fromEntries(byStatus.map(({ status, count }) => [status, parseInt(count)]))
    };
  }

  async getUserAnomalies(userId: string, query: GetAnomaliesDto) {
    const { page = 1, limit = 10, type, severity, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { user: { id: userId } };
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [anomalies, total] = await this.anomalyRepository.findAndCount({
      where,
      relations: ['user', 'resolvedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      data: anomalies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async detectAttendanceAnomalies(userId: string): Promise<Anomaly[]> {
    try {
      // 1. Get attendance data
      const threeMonthsAgo = subMonths(new Date(), 3);
      const startDate = startOfMonth(threeMonthsAgo);
      const endDate = endOfMonth(new Date());

      const attendance = await this.attendanceService.getYearlyAttendance(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (!attendance.length) {
        this.logger.warn(`No attendance data found for user ${userId}`);
        return [];
      }

      // 2. Format attendance data for LLM
      const attendanceSummary = this.formatAttendanceForLLM(attendance);

      // 3. Get similar historical cases
      const documents = await this.documentRepository.find();
      const similarCases = await this.aiService.findSimilarDocuments(
        attendanceSummary,
        documents.map(doc => ({
          content: doc.content,
          metadata: { title: doc.title }
        }))
      );

      // 4. Analyze with LLM
      const analysis = await this.analyzeWithLLM(attendanceSummary, similarCases);

      // 5. Save detected anomalies
      const savedAnomalies = await Promise.all(
        analysis.anomalies.map(anomaly =>
          this.anomalyRepository.save({
            ...anomaly,
            user: { id: userId },
            status: AnomalyStatus.DETECTED
          })
        )
      );

      this.logger.log(`Detected ${savedAnomalies.length} anomalies for user ${userId}`);
      return savedAnomalies;
    } catch (error) {
      this.logger.error(`Error detecting anomalies for user ${userId}`, error);
      throw error;
    }
  }

  async detectBulkAnomalies(userIds: string[]): Promise<Record<string, Anomaly[]>> {
    const results: Record<string, Anomaly[]> = {};
    
    for (const userId of userIds) {
      try {
        results[userId] = await this.detectAttendanceAnomalies(userId);
      } catch (error) {
        this.logger.error(`Error detecting anomalies for user ${userId}`, error);
        results[userId] = [];
      }
    }

    return results;
  }

  private formatAttendanceForLLM(attendance: DailyAttendance[]): string {
    const stats = {
      totalDays: attendance.length,
      lateArrivals: attendance.filter(a => a.startTime && new Date(a.startTime).getHours() >= 10).length,
      earlyDepartures: attendance.filter(a => a.endTime && new Date(a.endTime).getHours() < 17).length,
      absences: attendance.filter(a => a.status === AttendanceStatus.ABSENT).length,
      overtimeHours: attendance.reduce((sum, a) => {
        if (a.duration && a.duration > 8) {
          return sum + (a.duration - 8);
        }
        return sum;
      }, 0),
      weekendWork: attendance.filter(a => a.status === AttendanceStatus.WEEKEND).length
    };

    const recentAttendance = attendance
      .slice(-10)
      .map(a => `
        Date: ${a.date}
        Status: ${a.status}
        ${a.startTime ? `Start: ${a.startTime}` : ''}
        ${a.endTime ? `End: ${a.endTime}` : ''}
        ${a.duration ? `Duration: ${a.duration} hours` : ''}
        ${a.reason ? `Reason: ${a.reason}` : ''}
      `)
      .join('\n');

    return `
      Attendance Summary:
      - Total days: ${stats.totalDays}
      - Late arrivals: ${stats.lateArrivals}
      - Early departures: ${stats.earlyDepartures}
      - Absences: ${stats.absences}
      - Overtime hours: ${stats.overtimeHours}
      - Weekend work days: ${stats.weekendWork}

      Recent Attendance Pattern:
      ${recentAttendance}
    `;
  }

  private async analyzeWithLLM(attendanceSummary: string, similarCases: any[]): Promise<AnomalyAnalysis> {
    const context = similarCases
      .map(c => `Title: ${c.metadata.title}\nContent: ${c.content}`)
      .join('\n\n');

    const prompt = `
      Analyze this attendance data for anomalies and return a JSON response in this exact format:
      {
        "anomalies": [
          {
            "type": "ATTENDANCE", // Must be one of: ATTENDANCE, SALARY, PERFORMANCE
            "severity": "LOW|MEDIUM|HIGH",
            "description": "string",
            "details": {
              "metrics": { "key": number },
              "recommendations": ["string"]
            }
          }
        ]
      }

      Attendance Data:
      ${attendanceSummary}

      Similar Cases:
      ${context}

      Note: The "type" field MUST be one of: ATTENDANCE, SALARY, or PERFORMANCE. Do not use any other values.
    `;

    const response = await this.aiService.generateResponse(
      prompt,
      '',
      {
        systemPrompt: 'You are an HR analytics expert. Return ONLY the JSON response, no other text. Remember that anomaly types must be ATTENDANCE, SALARY, or PERFORMANCE.',
        instructions: [
          'Analyze the attendance data for patterns',
          'Identify any anomalies or unusual behavior',
          'Provide specific metrics and recommendations',
          'Return ONLY the JSON object, no other text',
          'Use only valid anomaly types: ATTENDANCE, SALARY, or PERFORMANCE'
        ]
      }
    );

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedResponse) as AnomalyAnalysis;
      
      // Validate the response structure
      if (!analysis.anomalies || !Array.isArray(analysis.anomalies)) {
        throw new Error('Invalid analysis response structure');
      }

      // Validate each anomaly
      analysis.anomalies.forEach(anomaly => {
        if (!anomaly.type || !anomaly.severity || !anomaly.description || !anomaly.details) {
          throw new Error('Invalid anomaly structure');
        }
        // Validate anomaly type
        if (!Object.values(AnomalyType).includes(anomaly.type)) {
          throw new Error(`Invalid anomaly type: ${anomaly.type}`);
        }
      });

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing attendance with LLM', error);
      throw new Error('Failed to analyze attendance patterns');
    }
  }

  async updateAnomalyStatus(
    id: string, 
    status: AnomalyStatus, 
    resolution?: string, 
    resolvedBy?: string
  ): Promise<Anomaly> {
    const anomaly = await this.anomalyRepository.findOne({ 
      where: { id },
      relations: ['user', 'resolvedBy']
    });
    
    if (!anomaly) {
      throw new NotFoundException('Anomaly not found');
    }

    anomaly.status = status;
    if (resolution) {
      anomaly.resolution = resolution;
    }
    if (resolvedBy) {
      anomaly.resolvedBy = { id: resolvedBy } as any;
    }

    return this.anomalyRepository.save(anomaly);
  }
} 