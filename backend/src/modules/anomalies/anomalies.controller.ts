import { Controller, Get, Post, Body, Param, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { AnomaliesService } from './anomalies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnomalyStatus } from './entities/anomaly.entity';
import { UpdateAnomalyStatusDto } from './dto/update-anomaly-status.dto';
import { GetAnomaliesDto } from './dto/get-anomalies.dto';

@Controller('anomalies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnomaliesController {
  constructor(private readonly anomaliesService: AnomaliesService) {}

  @Get()
  async getAnomalies(@Query() query: GetAnomaliesDto) {
    return this.anomaliesService.getAnomalies(query);
  }

  @Get('stats')
  async getAnomalyStats() {
    return this.anomaliesService.getAnomalyStats();
  }

  @Get('user/:userId')
  async getUserAnomalies(
    @Param('userId') userId: string,
    @Query() query: GetAnomaliesDto
  ) {
    return this.anomaliesService.getUserAnomalies(userId, query);
  }

  @Post('detect/:userId')
  async detectAnomalies(@Param('userId') userId: string) {
    try {
      return await this.anomaliesService.detectAttendanceAnomalies(userId);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to detect anomalies');
    }
  }

  @Post('detect-bulk')
  async detectBulkAnomalies(@Body() body: { userIds: string[] }) {
    if (!body.userIds?.length) {
      throw new BadRequestException('No user IDs provided');
    }
    return this.anomaliesService.detectBulkAnomalies(body.userIds);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnomalyStatusDto
  ) {
    try {
      return await this.anomaliesService.updateAnomalyStatus(
        id,
        updateDto.status,
        updateDto.resolution,
        updateDto.resolvedBy
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('Anomaly not found');
      }
      throw new BadRequestException('Failed to update anomaly status');
    }
  }
} 