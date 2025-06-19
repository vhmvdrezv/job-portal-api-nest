import { JobStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetJobsDto {
    @ApiProperty({
        description: 'Search by job title',
        example: 'Software Engineer',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    titleSearch: string;

    @ApiProperty({
        description: 'Search by city',
        example: 'New York',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    citySearch: string;

    @ApiProperty({
        description: 'Filter by job status',
        enum: JobStatus,
        example: JobStatus.ACTIVE,
        required: false
    })
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;

    @ApiProperty({
        description: 'Page number',
        example: 1,
        minimum: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number;
}