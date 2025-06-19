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
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ) { };


    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'Login successfull' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Req() req: any) {
        return this.authService.login(req.user);
    }

    
    @Post('register')
    @ApiOperation({ summary: 'User Register' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Resend email verification' })
    @ApiBody({ type: ResendVerificationEmailDto })
    @Post('resend-verification-email')
    @ApiResponse({ status: 200, description: 'Verification email sent' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async resendVerificationEmail(@Body() resendVerificationEmail: ResendVerificationEmailDto) {
        return this.authService.resendVerificationEmail(resendVerificationEmail)
    }

    @Get('verify-email')
    @ApiOperation({ summary: 'Verify email address' })
    @ApiQuery({ name: 'token', description: 'Verification token' })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @Post('forget-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ type: ForgetPasswordDto })
    @ApiResponse({ status: 201, description: 'Password reset email sent' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async forgetPassword(
        @Body() forgetpasswordDto: ForgetPasswordDto
    ) {
        return this.authService.forgetPassword(forgetpasswordDto);
    }

    @Patch('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(AuthGuard('google-seeker'))
    @Get('google/seeker')
    @ApiOperation({ summary: 'Google OAuth login for job seekers' })
    async googleSeekerLogin() {

    }

    @UseGuards(AuthGuard('google-seeker'))
    @Get('google/seeker-callback')
    @ApiOperation({ summary: 'Google OAuth callback for job seekers' })
    @ApiResponse({ status: 200, description: 'OAuth login successful' })
    async googleSeekerCallback(@Req() req: any) {
        const { accessToken } = req.user;
        return {
            accessToken
        }
    }

    @UseGuards(AuthGuard('google-employer'))
    @Get('google/employer')
    @ApiOperation({ summary: 'Google OAuth login for employers' })
    async googleEmployerLogin() {

    }

    @UseGuards(AuthGuard('google-employer'))
    @Get('google/employer-callback')
    @ApiOperation({ summary: 'Google OAuth callback for employers' })
    @ApiResponse({ status: 200, description: 'OAuth login successful' })
    async googleEmployerCallback(@Req() req: any) {
        const { accessToken } = req.user;
        return {
            accessToken
        }
    }

}
