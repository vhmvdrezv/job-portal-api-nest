import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetJobsDto } from './dto/get-jobs.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';


@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService
    ) { };

    @UseGuards(OptionalAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get all active jobs' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'titleSearch', required: false, description: 'Search by job title' })
    @ApiQuery({ name: 'citySearch', required: false, description: 'Search by city' })
    @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
    async getAllJobs(@Query() getJobsDto: GetJobsDto) {
        return this.jobsService.getAllJobs(getJobsDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Get('my-jobs')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get employer jobs' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by job status' })
    @ApiResponse({ status: 200, description: 'User jobs retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only employers allowed' })
    async getUserJobs(
        @Query() getJobsDto: GetJobsDto,
        @Req() req: any
    ) {
        return this.jobsService.getUserJobs(getJobsDto, req.user.userId)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create new job' })
    @ApiBody({ type: CreateJobDto })
    @ApiResponse({ status: 201, description: 'Job created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only employers allowed' })
    async createJob(@Body() createJobDto: CreateJobDto, @Req() req) {
        return this.jobsService.createJob(createJobDto, req.user.userId);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get job by ID' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    async getJobById(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.jobsService.getJobById(id, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Patch(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update job by ID' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiBody({ type: UpdateJobDto })
    @ApiResponse({ status: 200, description: 'Job updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only job owner allowed' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    async updateJobById(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto, @Req() req: any) {
        return this.jobsService.updateJob(id, updateJobDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Delete(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Delete job by ID' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only job owner allowed' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    async deleteJob(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.jobsService.deleteJob(id, req.user);
    }

}