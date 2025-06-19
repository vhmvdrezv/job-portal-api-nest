import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CustomLoggerService } from './common/services/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useLogger(new CustomLoggerService());

  const absoluteUploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(absoluteUploadsPath, {
    prefix: '/uploads/',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Portal API')
    .setDescription('A comprehensive job portal API for job seekers and employers')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('jobs', 'Job management endpoints')
    .addTag('application', 'Application management endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearir',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT-auth'
    )
    .build()
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();