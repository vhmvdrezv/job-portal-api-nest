import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { GetApplicationDto } from './dto/get-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

const storage = diskStorage({
    destination: './uploads/resumes',
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `resume-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new BadRequestException('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
};

@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationService: ApplicationsService) { }

    @UseGuards(ThrottlerGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEEKER)
    @Throttle({ short: { limit: 2, ttl: 60000 } })
    @Post('jobs/:jobId')
    @UseInterceptors(FileInterceptor('resume', {
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        }
    }))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create job application' })
    @ApiParam({ name: 'jobId', description: 'Job ID to apply for', type: 'number' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Application data with optional resume file',
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    description: 'Application description',
                    minLength: 10,
                    maxLength: 2000,
                    example: 'I am very interested in this position because...'
                },
                resume: {
                    type: 'string',
                    format: 'binary',
                    description: 'Resume file (PDF, JPG, JPEG, PNG, max 10MB)'
                }
            },
            required: ['description']
        }
    })
    @ApiResponse({ status: 201, description: 'Application submitted successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid data or file type' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only job seekers allowed' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 409, description: 'Already applied to this job' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    
    async createApplication(
        @Param('jobId', ParseIntPipe) jobId: number,
        @Body() createApplicationDto: CreateApplicationDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        return this.applicationService.createApplication(jobId, createApplicationDto, req.user.userId, file);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Get('jobs/:jobId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get applications for a specific job' })
    @ApiParam({ name: 'jobId', description: 'Job ID', type: 'number' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number', example: 3 })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by application status', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVIEWED'] })
    @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only employers can view job applications' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    
    async getApplicationForJob(
        @Query() getApplicationDto: GetApplicationDto,
        @Param('jobId', ParseIntPipe) jobId: number,
        @Req() req: any
    ) {
        return this.applicationService.getApplicationForJob(getApplicationDto, jobId, req.user.userId)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEEKER)
    @Get('my-applications')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get current user applications' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number', example: 3 })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by application status', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVIEWED'] })
    @ApiResponse({ status: 200, description: 'User applications retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only job seekers allowed' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserApplications(
        @Query() getApplicationDto: GetApplicationDto,
        @Req() req: any
    ) {
        return this.applicationService.getUserApplication(getApplicationDto, req.user.userId)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all applications (Admin only)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number', example: 3 })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by application status', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVIEWED'] })
    @ApiResponse({ status: 200, description: 'All applications retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only admins allowed' })
    async getAllApplications(
        @Query() getApplicationDto: GetApplicationDto
    ) {
        return this.applicationService.getAllApplication(getApplicationDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @Patch(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update application status' })
    @ApiParam({ name: 'id', description: 'Application ID', type: 'number' })
    @ApiBody({ type: UpdateApplicationDto })
    @ApiResponse({ status: 200, description: 'Application updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only employers can update applications for their jobs' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    async updateApplication(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateApplicationDto: UpdateApplicationDto,
        @Req() req: any
    ) {
        return this.applicationService.updateApplication(id, updateApplicationDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EMPLOYER, UserRole.SEEKER)
    @Get(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get application by ID' })
    @ApiParam({ name: 'id', description: 'Application ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only application owner, job owner, or admin allowed' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    async getApplicationById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.applicationService.getApplicationById(id, req.user.role, req.user.userId)
    }
}
