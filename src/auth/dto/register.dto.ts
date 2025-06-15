import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from "class-validator"


enum Role {
    SEEKER = 'SEEKER',
    EMPLOYER = 'EMPLOYER'
}

export class RegisterDto {
    
    @IsEmail()
    email: string

    @MinLength(8)
    password: string

    @IsNotEmpty()
    firstName: string;

    @IsOptional()
    @IsNotEmpty()
    lastName: string

    @IsEnum(Role)
    role: Role 
}