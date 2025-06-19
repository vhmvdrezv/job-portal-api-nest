import { ApplicationStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateApplicationDto {
    @ApiProperty({
        description: 'Application status to update',
        enum: ApplicationStatus,
        example: ApplicationStatus.REVIEWED,
        enumName: 'ApplicationStatus'
    })
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;
}