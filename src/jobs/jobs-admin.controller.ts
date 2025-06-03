import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guards";
import { GetJobsAdminDto } from "./dto/get-jobs-admin.dto";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorators";
import { UserRole } from "@prisma/client";

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
}