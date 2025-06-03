import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { JobsAdminController } from './jobs-admin.controller';

@Module({
  imports: [
    DatabaseModule
  ],
  controllers: [
    JobsController,
    JobsAdminController
  ],
  providers: [JobsService]
})
export class JobsModule {}
