import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { MailService } from 'src/mail/mail.service';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { VerifyEmailDto } from './dto/verfiy-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { User, UserRole, UserStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface GoogleUser {
    googleId: string,
    email: string,
    firstName: string,
    lastName: string,
    role: UserRole
}

@Injectable()
export class AuthService {
    constructor(
        private readonly mailService: MailService,
        private readonly databaseService: DatabaseService,
        private readonly jwtService: JwtService
    ) { };

    async validate(email: string, password: string) {
        const user = await this.databaseService.user.findUnique({
            where: {
                email
            }
        })

        if (!user) return null;

        if (!user.password) throw new BadRequestException('Try logging in with oauth');

        if (!user.isEmailVerified) throw new ForbiddenException('Please verify your email before logging in');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return null;

        return user;
    }

    async login(user: User) {
        const payload = { sub: user.id, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        return { accessToken: token }
    } 

    async googleLogin(googleUser: GoogleUser) {
        const { googleId, email, firstName, lastName, role } = googleUser;

        let user = await this.databaseService.user.findUnique({
            where: {
                email
            }
        });

        if (user) {
            if (!user.googleId) {
                await this.databaseService.user.update({
                    where: {
                        email
                    },
                    data: {
                        googleId,
                        isEmailVerified: true
                    }
                })
            }
        } else {
            user = await this.databaseService.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    googleId,
                    isEmailVerified: true,
                    status: UserStatus.ACTIVE,
                    role
                }
            })
        }

        const payload = { sub: user.id, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);

        return { accessToken }
    }

    async register(registerDto: RegisterDto) {
        const { email, password, firstName, lastName, role } = registerDto;

        const userExists = await this.databaseService.user.findUnique(({
            where: { email }
        }));
        if (userExists) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await this.databaseService.user.create({
            data: {
                firstName, 
                lastName, 
                email, 
                password: hashedPassword,
                role,
                status: 'ACTIVE'
            }
        });      

        await this.sendVerificationEmail(newUser.id, newUser.email);

        return {
            message: 'User registered. Please Check Your Email To Verify'
        }
    }

    private async sendVerificationEmail(userId: number, email: string) {
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 min

        await this.databaseService.emailVerification.create({
            data: {
                token,
                userId,
                expiresAt: expires
            }
        });

        const verificationLink = `https://job-portal-api-nest.onrender.com/auth/verify-email?token=${token}`;
        await this.mailService.sendEmail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
        });
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const { token } = verifyEmailDto;

        const emailVerificationExits = await this.databaseService.emailVerification.findUnique({
            where: {
                token
            }
        });

        if (!emailVerificationExits) {
            throw new BadRequestException('token not valid, try again');
        }

        if (emailVerificationExits.expiresAt < new Date()) {
            await this.databaseService.emailVerification.delete({
                where: {
                    token
                }
            });
            throw new BadRequestException('token expired');
        }

        await this.databaseService.$transaction([
            this.databaseService.user.update({
                where: {
                    id: emailVerificationExits.userId
                },
                data: {
                    isEmailVerified: true
                }
            }),
            this.databaseService.emailVerification.delete({
                where: {
                    token
                }
            })
        ])

        return{
            status: 'success',
            message: 'Email verfied successfully'
        }
    }

    async resendVerificationEmail(resendVerificationEmail: ResendVerificationEmailDto) {
        const { email } = resendVerificationEmail;

        const user = await this.databaseService.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            throw new BadRequestException('You didnt register with this email, try sign up!');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Your account has already verified.')
        }

        await this.sendVerificationEmail(user.id, email);

        return {
            message: "email sent, verify your account "
        }
    }

    async forgetPassword(forgetpasswordDto: ForgetPasswordDto) {
        const { email } = forgetpasswordDto;
        
        const user = await this.databaseService.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return {
                status: 'success',
                message: 'If your email exists in our system, you will receive a password reset link'
            }
        }

        if (!user.isEmailVerified) {
            throw new BadRequestException('Please verify your email first');
        }

        // Delete any existing password reset tokens for this user
        await this.databaseService.passwordReset.deleteMany({
            where: {
                userId: user.id
            }
        });

        // send email
        await this.sendPasswordResetEmail(user.id, user.email);


        return {
            status: 'success',
            message: 'If your email exists in our system, you will receive a password reset link',
        }
    }

    private async sendPasswordResetEmail(userId: number, email: string) {
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 10000 * 60 * 60); // 1 min

        await this.databaseService.passwordReset.create({
            data: {
                token,
                userId,
                expiresAt: expires
            }
        });

        const frontAppUrl = process.env.FRONTEND_URL || 'http://localhost:5000/';
        const resetLink = `${frontAppUrl}reset-password?token=${token}`;
        
        await this.mailService.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>This link will expire in 10 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                </div>
            `
        });        
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;

        const resetPasswordRecord = await this.databaseService.passwordReset.findUnique({
            where: {
                token
            }
        });

        if (!resetPasswordRecord) {
            throw new NotFoundException('Invalid or expired password reset token');
        }
        if (resetPasswordRecord.expiresAt < new Date()) {
            throw new BadRequestException('Token expired, please request a new password reset');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.databaseService.$transaction([
            this.databaseService.user.update({
                where: {
                    id: resetPasswordRecord.userId
                },
                data: {
                    password: hashedPassword
                }
            }),
            this.databaseService.passwordReset.delete({
                where: {
                    token
                }
            })
        ]);

        return {
            status: 'success',
            message: 'Password reset successfully'
        }
    }
}
