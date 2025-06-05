import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobStatus, } from '@prisma/client';
import { GetApplicationDto } from './dto/get-application.dto';

@Injectable()
export class ApplicationsService {
    constructor(
        private readonly databaseService: DatabaseService
    ) {}

    async createApplication(
        jobId: number, 
        createApplicationDto: CreateApplicationDto, 
        userId: number,
        file?: Express.Multer.File
    ) {
        const { description } = createApplicationDto;

        // Check if job exists and is active
        const job = await this.databaseService.job.findUnique({
            where: {
                id: jobId
            }
        });

        if (!job) throw new NotFoundException(`Job with id ${jobId} not found`);
        if (job.status !== JobStatus.ACTIVE) {
            throw new BadRequestException('Cannot apply to inactive jobs');
        }

        // Check if user already applied to this job
        const existingApplication = await this.databaseService.application.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        });
        
        if (existingApplication) throw new ConflictException('You have already applied to this job');

        const applicationData: any = {
            description,
            userId,
            jobId
        }

        
        // Handle file upload if provided
        if (file) {
            applicationData.resumePath = file.path;
            applicationData.resumeType = file.mimetype;
            applicationData.originalFileName = file.originalname;
        }

        const application = await this.databaseService.application.create({
            data: applicationData,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            omit: {
                createdAt: true,
                updatedAt: true,

            }
        });
        
        return {
            status: 'success',
            message: 'Application submitted successfully',
            data: application
        };
    }

    async getAllApplication(getApplicationDto: GetApplicationDto) {
        const { page = 1, limit = 3, status } = getApplicationDto;

        const where: any = {
            status
        }

        const applications = await this.databaseService.application.findMany({
            where,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit
        });

        const total = await this.databaseService.application.count({
            where
        });

        const totalPages = Math.ceil(total / limit);

        return {
            status: 'success',
            message: 'All applications retrieved successfully',
            data: applications,
            pagination: {
                currentPage: page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                total
            }
        };



    }
}

