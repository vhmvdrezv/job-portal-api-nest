import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server error';
        let error = 'Internal Server Error';

        // Log the full error for debugging (only in development)
        if (process.env.NODE_ENV !== 'production') {
            this.logger.error('Exception caught: ', exception);
        }

        // Handle different types of exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();

            if (typeof response === 'string') {
                message = response;
            } else if (typeof response === 'object' && response !== null) {
                message = (response as any).message || exception.message;
                error = (response as any).error || exception.name;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    message = 'A record with this information already exists';
                    error = 'Duplicate Entry';
                    status = HttpStatus.CONFLICT;
                    break;
                case 'P2025':
                    message = 'Record not found';
                    error = 'Not Found';
                    status = HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Invalid reference to related record';
                    error = 'Foreign Key Constraint';
                    status = HttpStatus.BAD_REQUEST;
                    break;
                default:
                    message = 'Database error';
                    error = `Prisma Error ${exception.code}`;
                    status = HttpStatus.BAD_REQUEST;
                    break;
            } 
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            // Handle Prisma validation errors
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
            error = 'Validation Error';
        } else if (exception instanceof Error) {
            // Handle other known errors
            message = exception.message || 'Something went wrong';
            error = exception.name || 'Error';
            
            // Log unexpected errors
            this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
        }
        const errorResponse = {
            status: 'error',
            message,
            error,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        
        // Don't include stack trace in production
        if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
            (errorResponse as any).stack = exception.stack;
        }

        response.status(status).json(errorResponse);
    }
}