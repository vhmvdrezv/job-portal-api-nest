

import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus, JobStatus, UserRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

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
}
