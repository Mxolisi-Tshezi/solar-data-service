export interface ErrorWithCode extends Error {
    code?: string;
    statusCode?: number;
}
/**
 * Custom error handler to standardize error objects
 */
export declare class ErrorHandler {
    static handle(error: unknown): ErrorWithCode;
    /**
     * Log and handle API errors
     */
    static handleApiError(error: unknown): {
        statusCode: number;
        body: string;
    };
}
