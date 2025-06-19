import { ApplicationStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetApplicationDto {
    @ApiProperty({
        description: 'Filter applications by status',
        enum: ApplicationStatus,
        example: ApplicationStatus.PENDING,
        required: false,
        enumName: 'ApplicationStatus'
    })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        required: false,
        type: 'number'
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number

    @ApiProperty({
        description: 'Number of items per page',
        example: 3,
        minimum: 1,
        required: false,
        type: 'number'
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number
}