import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class LocationDto {
    @ApiProperty({
        description: 'City name',
        example: 'New York'
    })
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        description: 'Street address',
        example: '123 Main St',
        required: false
    })
    street?: string;

    @ApiProperty({
        description: 'Alley or additional location info',
        example: 'Suite 100',
        required: false
    })
    alley?: string;
}

export class CreateJobDto {
    @ApiProperty({
        description: 'Job title',
        example: 'Software Engineer'
    })
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Job description',
        example: 'We are looking for a skilled software engineer...'
    })
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Job location details',
        type: LocationDto,
        required: false
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location?: LocationDto;

    @ApiProperty({
        description: 'Job salary',
        example: 75000,
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    salary?: number;
}