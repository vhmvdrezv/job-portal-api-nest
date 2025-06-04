import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { UserRole } from '@prisma/client';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetJobsDto } from './dto/get-jobs.dto';

@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService
    ) { };

    @UseGuards(OptionalAuthGuard)
    @Get()
    async getAllJobs(@Query() getJobsDto: GetJobsDto, @Req() req) {
        return this.jobsService.getAllJobs(getJobsDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Post()
    async createJob(@Body() createJobDto: CreateJobDto, @Req() req) {
        return this.jobsService.createJob(createJobDto, req.user.userId);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    async getJobById(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.jobsService.getJobById(id, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Patch(':id')
    async updateJobById(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto, @Req() req: any) {
        return this.jobsService.updateJob(id, updateJobDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Delete(':id')
    async deleteJob(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.jobsService.deleteJob(id, req.user);
    }

}