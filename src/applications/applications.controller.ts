import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { GetApplicationDto } from './dto/get-application.dto';

const storage = diskStorage({
    destination: './uploads/resumes',
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `resume-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
    }
};

@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationService: ApplicationsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEEKER)
    @Post('jobs/:jobId')
    @UseInterceptors(FileInterceptor('resume', {
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        }
    }))
    async createApplication(
        @Param('jobId', ParseIntPipe) jobId: number,
        @Body() createApplicationDto: CreateApplicationDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        return this.applicationService.createApplication(jobId, createApplicationDto, req.user.userId, file);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async getAllApplications(@Query() getApplicationDto: GetApplicationDto) { 
        return this.applicationService.getAllApplication(getApplicationDto);
    }
}
