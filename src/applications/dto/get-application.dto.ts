import { ApplicationStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";

export class GetApplicationDto {
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number

}