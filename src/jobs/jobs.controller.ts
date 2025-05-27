import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { RolesGuard } from 'src/common/guards/roles.guards';

@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService
    ) { };

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllJobs() {
        return this.jobsService.getAllJobs();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYER')
    @Post()
    async createJob(@Body() createJobDto: CreateJobDto) {
        return this.jobsService.createJob(createJobDto);
    }

    @Get(':id')
    async getJobById(@Param('id', ParseIntPipe) id: number) {
        return this.jobsService.getJobById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYER')
    @Patch(':id')
    async updateJobById(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto) {
        return this.jobsService.updateJob(id, updateJobDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYER')
    @Delete(':id')
    async deleteJob(@Param('id', ParseIntPipe) id: number) {
        return this.jobsService.deleteJob(id);
    }

}