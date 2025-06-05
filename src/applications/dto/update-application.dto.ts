import { ApplicationStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateApplicationDto {
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;
}