import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus, UserRole } from '@prisma/client';
import { GetJobsDto } from './dto/get-jobs.dto';
import { GetJobsAdminDto } from './dto/get-jobs-admin.dto';
import { UpdateJobAdminDto } from './dto/update-job-admin.dto';
import { contains } from 'class-validator';

@Injectable()
export class JobsService {
    constructor(
        private readonly databaseService: DatabaseService
    ) { };


    async getAllJobs(getJobsDto: GetJobsDto) {
        const { page = 1, limit = 5, titleSearch, citySearch } = getJobsDto;
        const where: any = { status: JobStatus.ACTIVE };
        if (titleSearch) where.title = {
            contains: titleSearch.trim(),
            mode: 'insensitive'
        }

        if (citySearch) where.jobLocation = {
            city: {
                contains: citySearch.trim(),
                mode: 'insensitive'
            }
        }
        
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
        const { page = 1, limit = 5, status, titleSearch, citySearch } = getJobsDto;

        const where: any = { };

        if (status) where.status = status;
        if (titleSearch) where.title = {
            contains: titleSearch.trim(),
            mode: 'insensitive'
        }

        if (citySearch) where.jobLocation = {
            city: {
                contains: citySearch.trim(),
                mode: 'insensitive'
            }
        }

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

    async getUserJobs(getJobsDto: GetJobsDto, userId: number) {
        const { page = 1, limit = 5, status } = getJobsDto;

        const user = await this.databaseService.user.findUnique({
            where: {
                id: userId
            } 
        });
        if (!user) throw new NotFoundException('user not found');

        const where: any = {
            userId,
            status
        };
        if (status) where.status = status;

        const jobs = await this.databaseService.job.findMany({
            where,
            include: {
                jobLocation: true
            },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        
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

    async updateJobAdmin(id: number, updateJobDto: UpdateJobAdminDto) {
        const { status } = updateJobDto;

        const jobExists = await this.databaseService.job.findUnique({
            where: {
                id
            }
        });

        if (!jobExists) throw new NotFoundException(`job with id ${id} not found`);

        const updatedJob = await this.databaseService.job.update({
            where: {
                id
            },
            data: {
                status
            },
            include: { jobLocation: true },
            omit: {
                createdAt: true,
                updatedAt: true,
            }
        });

        return {
            status: 'success',
            message: `job with id ${id} updated`,
            data: updatedJob
        }

    }

    async deleteJob(id: number, user: any) {
        const job = await this.databaseService.job.findUnique({
            where: {
                id
            }
        });

        if (!job) throw new NotFoundException(`job with id ${id} not found`);

        if (job.userId !== user.userId) throw new ForbiddenException(`You dont have access to delete this job`)

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
