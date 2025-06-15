import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { GetMonthlyAttendanceDto } from './dto/get-monthly-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('monthly')
  async getMonthlyAttendance(
    @Request() req,
    @Query() query: GetMonthlyAttendanceDto
  ) {
    return this.attendanceService.getMonthlyAttendance(
      req.user.id,
      query.month,
      query.year
    );
  }

  @Get('yearly')
  async getYearlyAttendance(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.attendanceService.getYearlyAttendance(
      req.user.id,
      startDate,
      endDate
    );
  }

  @Post('check-in')
  checkIn(@Request() req) {
    return this.attendanceService.checkIn(req.user.id);
  }

  @Post('check-out')
  checkOut(@Request() req) {
    return this.attendanceService.checkOut(req.user.id);
  }

  @Get('summary')
  async getAttendanceSummary(@Query('date') date?: string) {
    return this.attendanceService.getAttendanceSummary(date);
  }

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('pending')
  getPendingLeaveRequests() {
    return this.attendanceService.getPendingLeaveRequests();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.attendanceService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }


} 