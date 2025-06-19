import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guard";
import { GetJobsAdminDto } from "./dto/get-jobs-admin.dto";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { UpdateJobAdminDto } from "./dto/update-job-admin.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";

@Controller('admin/jobs')
export class JobsAdminController {
    constructor(
        private readonly jobsService: JobsService
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all jobs (admin only)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'titleSearch', required: false, description: 'Search by job title' })
    @ApiQuery({ name: 'citySearch', required: false, description: 'Search by city' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by job status' })
    @ApiResponse({ status: 200, description: 'All jobs retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    getAllJobs(@Query() getJobsDto: GetJobsAdminDto) {
        return this.jobsService.getAllJobsAdmin(getJobsDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update job status (admin only)' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiBody({ type: UpdateJobAdminDto })
    @ApiResponse({ status: 200, description: 'Job status updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    updateJob(@Param('id', ParseIntPipe) id: number, @Body() updateJobAdminDto: UpdateJobAdminDto) {
        return this.jobsService.updateJobAdmin(id, updateJobAdminDto)
    }
}