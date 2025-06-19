import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyEmailDto {
    @ApiProperty({
        description: 'Email verification token received via email',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        minLength: 1
    })
    @IsString()
    token: string;
}