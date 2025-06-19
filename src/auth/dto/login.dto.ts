import { IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 8 characters)',
        example: 'password123',
        minLength: 8
    })
    @MinLength(8)
    password: string;
}