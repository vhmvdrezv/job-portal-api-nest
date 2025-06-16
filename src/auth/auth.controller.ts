import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { VerifyEmailDto } from './dto/verfiy-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')

@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ) { };


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: any) {
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

    @Post('forget-password')
    async forgetPassword(
        @Body() forgetpasswordDto: ForgetPasswordDto
    ) {
        return this.authService.forgetPassword(forgetpasswordDto);
    }

    @Patch('reset-password')
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(AuthGuard('google-seeker'))
    @Get('google/seeker')
    async googleSeekerLogin() {

    }

    @UseGuards(AuthGuard('google-seeker'))
    @Get('google/seeker-callback')
    async googleSeekerCallback(@Req() req: any) {
        const { accessToken } = req.user;
        return {
            accessToken
        }
    }

    @UseGuards(AuthGuard('google-employer'))
    @Get('google/employer')
    async googleEmployerLogin() {

    }

    @UseGuards(AuthGuard('google-employer'))
    @Get('google/employer-callback')
    async googleEmployerCallback(@Req() req: any) {
        const { accessToken } = req.user;
        return {
            accessToken
        }
    }

}
