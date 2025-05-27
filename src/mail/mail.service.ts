import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendEmail({to, subject, html}: SendEmailOptions) {
        try {
            await this.transporter.sendMail({
                from: '"Job Portal"',
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }
}

