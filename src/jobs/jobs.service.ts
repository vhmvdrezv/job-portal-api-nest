import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
    constructor(
        private readonly databaseService: DatabaseService
    ) { };


    async getAllJobs() {
        const jobs = await this.databaseService.job.findMany({
            where: { },
            include: { jobLocation: true },
            omit: {
                createdAt: true,
                updatedAt: true,

            }
        })

        // implementing pagination
        return {
            status: 'success',
            message: 'all jobs retrieved.',
            data: jobs
        }
    }

    async createJob(createJobDto: CreateJobDto) {
        const { title, description, location, salary } = createJobDto;

        const result = await this.databaseService.$transaction(async (tx) => {
            const job = await tx.job.create({
                data: {
                    title, description, salary
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

    async getJobById(id: number) {
        const job = await this.databaseService.job.findUnique({
            where: { id },
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            include: { jobLocation: true }
        });

        if (!job) throw new NotFoundException(`not found job with id ${id}`);

        return {
            status: "success",
            message: "",
            data: job
        }
    }
    
    async updateJob(id: number, updateJobDto: UpdateJobDto) {
        const { title, description, salary, location } = updateJobDto;
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
