import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { Salary } from './entities/salary.entity';
import { Query } from '@nestjs/common';

@Controller('salaries')
export class SalaryController {
    constructor(private readonly salaryService: SalaryService) { }

    
    @Get('user')
    findByUser(@Query('userId') userId?: string) {
        if(!userId) return null;
        return this.salaryService.findByUser(userId);
    }
    
    @Get()
    findAll() {
        return this.salaryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salaryService.findOne(id);
    }

    @Post()
    create(@Body() data: Partial<Salary>) {
        return this.salaryService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Partial<Salary>) {
        return this.salaryService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salaryService.remove(id);
    }

} 