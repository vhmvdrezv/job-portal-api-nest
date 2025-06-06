import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [JobsModule, DatabaseModule, AuthModule, MailModule, ConfigModule.forRoot({ isGlobal: true }), ApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
