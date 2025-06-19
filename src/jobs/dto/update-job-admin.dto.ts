import { JobStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateJobAdminDto {
    @ApiProperty({
        description: 'Job status to update',
        enum: JobStatus,
        example: JobStatus.ACTIVE,
        enumName: 'JobStatus'
    })
    @IsEnum(JobStatus)
    status: JobStatus
}