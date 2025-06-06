import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobStatus, UserRole, } from '@prisma/client';
import { GetApplicationDto } from './dto/get-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

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

        
        const where: any = { }
        if (status) where.status = status;

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

    async getApplicationForJob(getApplicationDto: GetApplicationDto, jobId: number, userId: number) {
        const { page = 1, limit = 3, status } = getApplicationDto;

        const job = await this.databaseService.job.findUnique({
            where: {
                id: jobId
            }
        });
        
        if (!job) throw new NotFoundException(`Job with id ${jobId} not found`);
        if (job.userId !== userId) throw new ForbiddenException('You can only view applications for your own jobs')

        const where: any = { jobId };
        if (status) {
            where.status = status;
        }

        const applications = await this.databaseService.application.findMany({
            where: {
                status,
                jobId
            }, 
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            omit: {
                createdAt: true,
                updatedAt: true,
                userId: true,
            },
            skip: (page - 1) * limit,
            take: limit
        });

        const total = await this.databaseService.application.count({ where });
        const totalPages = Math.ceil(total / limit);

        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return { 
            status: 'success',
            message: 'Applications retrieved successfully',
            data: applications,
            pagination: {
                currentPage: page,
                totalPages,
                hasNext,
                hasPrev,
                total
            }
        }
    }

    async updateApplication(id: number, updateApplicationDto: UpdateApplicationDto, userId: number) {
        const { status } = updateApplicationDto;
        
        const application = await this.databaseService.application.findUnique({
            where: {
                id
            },
            include: {
                job: true
            }
        });

        if (!application) throw new NotFoundException(`application not found`);
        if (application.job.userId !== userId) throw new ForbiddenException('You can only update applications for your own jobs');

        const updatedApplication = await this.databaseService.application.update({
            where: {
                id
            },
            data: {
                status
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        return {
            status: 'success',
            message: 'Application updated successfully',
            data: updatedApplication,
        }
    }

    async getApplicationById(applicationId: number, userRole: string, userId: number) {
        const application = await this.databaseService.application.findUnique({
            where: {
                id: applicationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                job: {
                    omit: {
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        });

        if (!application) throw new NotFoundException(`Application with id ${applicationId} not found`);
        if (userRole !== UserRole.ADMIN) {
            if (!(application.userId === userId || application.job.userId === userId)) {
                throw new ForbiddenException('You do not have permission to view this application');
            }
        }

        return {
            status: 'success',
            message: 'Application retrieved successfully',
            data: application,
        }
    }

    async getUserApplication(getApplicationDto: GetApplicationDto, userId: number) {
        const { page = 1, limit = 3, status } = getApplicationDto;

        const where: any = {
            userId
        };
        if (status) where.status = status;

        const user = await this.databaseService.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const applications = await this.databaseService.application.findMany({
            where,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        })
        
        const total = await this.databaseService.application.count({ where });
        const totalPages = Math.ceil(total / limit);

        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return { 
            status: 'success',
            message: 'Applications retrieved successfully',
            data: applications,
            pagination: {
                currentPage: page,
                totalPages,
                hasNext,
                hasPrev,
                total
            }
        }
    }
}

