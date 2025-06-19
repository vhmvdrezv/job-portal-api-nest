import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgetPasswordDto {
    @ApiProperty({
        description: 'Email address to send password reset link',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string
}