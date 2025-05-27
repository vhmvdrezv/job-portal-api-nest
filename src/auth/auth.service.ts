import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { MailService } from 'src/mail/mail.service';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { VerifyEmailDto } from './dto/verfiy-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

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

        const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
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
}
