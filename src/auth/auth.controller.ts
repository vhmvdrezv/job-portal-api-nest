import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { Verify } from 'crypto';
import { VerifyEmailDto } from './dto/verfiy-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ) { };

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('resend-verification-email')
    async resendVerificationEmail(@Body() resendVerificationEmail: ResendVerificationEmailDto) {
        return this.authService.resendVerificationEmail(resendVerificationEmail)
    }

    @Get('verify-email')
    async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }
}
