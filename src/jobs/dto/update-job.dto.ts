import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class LocationDto {
    @ApiProperty({
        description: 'City name',
        example: 'New York',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    city?: string;

    @ApiProperty({
        description: 'Street address',
        example: '123 Main St',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    street?: string;

    @ApiProperty({
        description: 'Alley or additional location info',
        example: 'Suite 100',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    alley?: string;
}

export class UpdateJobDto {
    @ApiProperty({
        description: 'Job title',
        example: 'Senior Software Engineer',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    title?: string;

    @ApiProperty({
        description: 'Job description',
        example: 'We are looking for an experienced senior software engineer...',
        required: false
    })
    @IsNotEmpty()
    @IsOptional()
    description?: string;

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
        example: 85000,
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    salary?: number;
}