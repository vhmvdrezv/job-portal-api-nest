import { JobStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class GetJobsAdminDto {

    @IsOptional()
    @IsNotEmpty()
    titleSearch: string;

    @IsOptional()
    @IsNotEmpty()
    citySearch: string;

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