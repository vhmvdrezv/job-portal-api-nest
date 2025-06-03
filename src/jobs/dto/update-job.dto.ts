import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

class LocationDto {
    @IsOptional()
    @IsNotEmpty()
    city?: string;

    @IsOptional()
    @IsNotEmpty()
    street?: string;

    @IsOptional()
    @IsNotEmpty()
    alley?: string;
}

export class UpdateJobDto {
    @IsOptional()
    @IsNotEmpty()
    title?: string;

    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location?: LocationDto;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    salary?: number;
}