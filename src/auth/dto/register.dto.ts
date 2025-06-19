import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator"


enum Role {
    SEEKER = 'SEEKER',
    EMPLOYER = 'EMPLOYER'
}

export class RegisterDto {
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

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        minLength: 1
    })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        minLength: 1
    })
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'User role - either job seeker or employer',
        enum: Role,
        example: Role.SEEKER,
        enumName: 'UserRole'
    })
    @IsEnum(Role)
    role: Role;
}