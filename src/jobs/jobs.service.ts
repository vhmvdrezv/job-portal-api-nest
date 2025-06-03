import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus, UserRole } from '@prisma/client';
import { GetJobsDto } from './dto/get-jobs.dto';
import { take } from 'rxjs';
import { GetJobsAdminDto } from './dto/get-jobs-admin.dto';

@Injectable()
export class JobsService {
    constructor(
        private readonly databaseService: DatabaseService
    ) { };


    async getAllJobs(getJobsDto: GetJobsDto, user: any) {
        const { page = 1, limit = 5} = getJobsDto;

        const where: any = { status: JobStatus.ACTIVE };

        const jobs = await this.databaseService.job.findMany({
            where,
            include: { jobLocation: true },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        })

        const total = await this.databaseService.job.count({
            where,
        })

        const totalPages = Math.ceil(total / limit);

        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // implementing pagination
        return {
            status: 'success',
            message: 'all jobs retrieved.',
            data: jobs,
            hasPrev,
            hasNext,
            totalPages
        }
    }

    async getAllJobsAdmin(getJobsDto: GetJobsAdminDto) {
        const { page = 1, limit = 5, status } = getJobsDto;

        const where: any = { };

        if (status) where.status = status;

        const jobs = await this.databaseService.job.findMany({
            where,
            include: { jobLocation: true },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        })

        const total = await this.databaseService.job.count({
            where,
        })

        const totalPages = Math.ceil(total / limit);

        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // implementing pagination
        return {
            status: 'success',
            message: 'all jobs retrieved.',
            data: jobs,
            hasPrev,
            hasNext,
            totalPages
        }
    }

    async createJob(createJobDto: CreateJobDto, userId: number) {
        const { title, description, location, salary } = createJobDto;

        const result = await this.databaseService.$transaction(async (tx) => {
            const job = await tx.job.create({
                data: {
                    title,
                    description,
                    salary,
                    userId
                }
            });

            if (location) {
                await tx.jobLocation.create({
                    data: {
                        jobId: job.id,
                        ...location
                    }
                })
            }

            return job;
        })

        return {
            status: 'success',
            message: 'job created successfully',
            data: result
        }
    } 

    async getJobById(id: number, user: any) {
        const job = await this.databaseService.job.findUnique({
            where: { id },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            include: { jobLocation: true }
        });

        if (!job) throw new NotFoundException(`not found job with id ${id}`);

        // Only allow access to this job if:
        // - It's active
        // - Or the user is an admin
        // - Or the user is the owner
        // Otherwise, pretend the job doesn't exist to unauthorized users
        const isInactive = job.status !== JobStatus.ACTIVE;
        const isNotAdmin = user?.role !== UserRole.ADMIN;
        const isNotOwner = job.userId !== user?.id;

        if (isInactive && isNotAdmin && isNotOwner) {
            throw new NotFoundException(`job with id ${id} not found`);
        }

        return {
            status: "success",
            message: "",
            data: job
        }
    }
    
    async updateJob(id: number, updateJobDto: UpdateJobDto, user: any) {
        const { title, description, salary, location } = updateJobDto;

        const job = await this.databaseService.job.findUnique({
            where: {
                id
            }
        })
        
        if (!job) throw new NotFoundException('job not found');
        if (job.userId !== user.userId) throw new ForbiddenException('You dont have access to update this job');
        if (job.status !== JobStatus.ACTIVE) throw new ForbiddenException('You can`t update pending jobs')

        const result = await this.databaseService.$transaction(async (tx) => {
            const job = await tx.job.update({
                where: { id }, 
                data: {
                    title, description, salary, status: JobStatus.PENDING
                }
            });

            if (!job) throw new NotFoundException(`job with id ${id} not found`);

            if (location) {
                await tx.jobLocation.update({
                    where: {
                        jobId: job.id
                    },
                    data: {
                        ...location
                    }
                })
            }

            return job;
        })

        return {
            status: "success",
            message: "job updated successfully",
            data: result
        }
    }

    async deleteJob(id: number) {
        const job = await this.databaseService.job.findUnique({
            where: {
                id
            }
        });

        if (!job) throw new NotFoundException(`job with id ${id} not found`)

        await this.databaseService.job.delete({
            where: {
                id
            }
        });

        return {
            status: "success",
            message: "job deleted successfully"
        }
    }
}
