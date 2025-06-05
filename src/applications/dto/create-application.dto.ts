import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    description: string;
}