import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ApplicationsModule } from './applications/applications.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    JobsModule, 
    DatabaseModule,
    AuthModule,
    MailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ApplicationsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10 
      },
      {
        name: 'medium',
        ttl: 300000, // 5 minutes
        limit: 100
      }
    ])
  ],
})
export class AppModule {}
