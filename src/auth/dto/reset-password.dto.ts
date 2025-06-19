import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Password reset token received via email',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        minLength: 1
    })
    @IsString()
    token: string;

    @ApiProperty({
        description: 'New password (minimum 8 characters)',
        example: 'newPassword123',
        minLength: 8
    })
    @MinLength(8)
    newPassword: string;
}