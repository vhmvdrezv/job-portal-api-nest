import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

class LocationDto {
    @IsNotEmpty()
    city: string;

    street?: string;

    alley?: string;
}

export class CreateJobDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location?: LocationDto;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    salary?: number;
}