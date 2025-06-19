import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendVerificationEmailDto {
    @ApiProperty({
        description: 'Email address to resend verification email',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;
}
