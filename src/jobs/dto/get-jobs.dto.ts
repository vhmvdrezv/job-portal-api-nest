import { JobStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";

export class GetJobsDto {
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number;
}