import { logger } from './logger';

export interface ErrorWithCode extends Error {
    code?: string;
    statusCode?: number;
}

/**
 * Custom error handler to standardize error objects
 */
export class ErrorHandler {
    public static handle(error: unknown): ErrorWithCode {
        if (error instanceof Error) {
            return error;
        }

        // If it's not an error object, convert it to one
        const message = typeof error === 'string' ? error : JSON.stringify(error);
        return new Error(message);
    }

    /**
     * Log and handle API errors
     */
    public static handleApiError(error: unknown): { statusCode: number; body: string } {
        const err = this.handle(error);
        logger.error('API Error', err);

        const statusCode = (err as ErrorWithCode).statusCode || 500;

        return {
            statusCode,
            body: JSON.stringify({
                message: err.message,
                code: (err as ErrorWithCode).code || 'INTERNAL_SERVER_ERROR'
            })
        };
    }
}