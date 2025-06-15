import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Put } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateMetricsDto } from './dto/update-metrics.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AddPeerReviewDto } from './dto/add-peer-review.dto';
import { UpdateCompetenciesDto } from './dto/update-competencies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto, @Request() req) {
    return this.goalsService.create(createGoalDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.goalsService.findAll();
  }

  @Get('employee/:id')
  findByEmployee(@Param('id') id: string) {
    return this.goalsService.findByEmployee(id);
  }

  @Get('manager/:id')
  findByManager(@Param('id') id: string) {
    return this.goalsService.findByManager(id);
  }

  @Put(':id/progress')
  updateProgress(@Param('id') id: string, @Request() req, @Body('progress') progress: number) {
    return this.goalsService.updateProgress(id, req.user.id, progress);
  }

  @Put(':id/metrics')
  updateMetrics(@Param('id') id: string, @Request() req, @Body() updateMetricsDto: UpdateMetricsDto) {
    return this.goalsService.updateMetrics(id, req.user.id, updateMetricsDto);
  }

  @Put(':id/feedback')
  updateFeedback(
    @Param('id') id: string,
    @Request() req,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Body('isManager') isManager: boolean
  ) {
    return this.goalsService.updateFeedback(id, req.user.id, updateFeedbackDto, isManager);
  }

  @Get('team-metrics/:managerId')
  getTeamMetrics(@Param('managerId') managerId: string) {
    return this.goalsService.getTeamMetrics(managerId);
  }

  @Post(':id/peer-review')
  addPeerReview(
    @Param('id') id: string,
    @Request() req,
    @Body() addPeerReviewDto: AddPeerReviewDto
  ) {
    return this.goalsService.addPeerReview(id, req.user.id, addPeerReviewDto);
  }

  @Put(':id/competencies')
  updateCompetencies(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCompetenciesDto: UpdateCompetenciesDto,
    @Body('isManager') isManager: boolean
  ) {
    return this.goalsService.updateCompetencies(id, req.user.id, updateCompetenciesDto, isManager);
  }

  @Post(':id/activate')
  activateGoal(
    @Param('id') id: string,
    @Request() req,
    @Body('feedback') feedback: string
  ) {
    return this.goalsService.activateGoal(id, req.user.id, feedback);
  }

  @Post(':id/submit-review')
  submitForReview(@Param('id') id: string, @Request() req) {
    return this.goalsService.submitForReview(id, req.user.id);
  }

  @Post(':id/approve-review')
  approveReview(@Param('id') id: string, @Request() req) {
    return this.goalsService.approveReview(id, req.user.id);
  }

  @Post(':id/reject-review')
  rejectReview(@Param('id') id: string, @Request() req, @Body('feedback') feedback: string) {
    return this.goalsService.rejectReview(id, req.user.id, feedback);
  }
} 