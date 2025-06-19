import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateApplicationDto {
    @ApiProperty({
        description: 'Application description explaining why you are interested in this position',
        example: 'I am very interested in this position because I have 3 years of experience in software development and I believe my skills align perfectly with the requirements. I am passionate about creating innovative solutions and working in a collaborative environment.',
        minLength: 10,
        maxLength: 2000
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    description: string;
}