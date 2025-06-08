import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guard";
import { GetJobsAdminDto } from "./dto/get-jobs-admin.dto";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { UpdateJobAdminDto } from "./dto/update-job-admin.dto";

@Controller('admin/jobs')
export class JobsAdminController {
    constructor(
        private readonly jobsService: JobsService
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    getAllJobs(@Query() getJobsDto: GetJobsAdminDto) {
        return this.jobsService.getAllJobsAdmin(getJobsDto);
    }

    @Patch(':id')
    updateJob(@Param('id', ParseIntPipe) id: number, @Body() updateJobAdminDto: UpdateJobAdminDto) {
        return this.jobsService.updateJobAdmin(id, updateJobAdminDto)
    }
}