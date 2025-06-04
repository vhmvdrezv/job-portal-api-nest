import { JobStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateJobAdminDto {
    @IsEnum(JobStatus)
    status: JobStatus
}