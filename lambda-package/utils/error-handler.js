"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = require("./logger");
/**
 * Custom error handler to standardize error objects
 */
class ErrorHandler {
    static handle(error) {
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
    static handleApiError(error) {
        const err = this.handle(error);
        logger_1.logger.error('API Error', err);
        const statusCode = err.statusCode || 500;
        return {
            statusCode,
            body: JSON.stringify({
                message: err.message,
                code: err.code || 'INTERNAL_SERVER_ERROR'
            })
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9lcnJvci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFrQztBQU9sQzs7R0FFRztBQUNILE1BQWEsWUFBWTtJQUNkLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBYztRQUMvQixJQUFJLEtBQUssWUFBWSxLQUFLLEVBQUUsQ0FBQztZQUN6QixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsaURBQWlEO1FBQ2pELE1BQU0sT0FBTyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFFLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFjO1FBQ3ZDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsZUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0IsTUFBTSxVQUFVLEdBQUksR0FBcUIsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDO1FBRTVELE9BQU87WUFDSCxVQUFVO1lBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsSUFBSSxFQUFHLEdBQXFCLENBQUMsSUFBSSxJQUFJLHVCQUF1QjthQUMvRCxDQUFDO1NBQ0wsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQTVCRCxvQ0E0QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yV2l0aENvZGUgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICBjb2RlPzogc3RyaW5nO1xyXG4gICAgc3RhdHVzQ29kZT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1c3RvbSBlcnJvciBoYW5kbGVyIHRvIHN0YW5kYXJkaXplIGVycm9yIG9iamVjdHNcclxuICovXHJcbmV4cG9ydCBjbGFzcyBFcnJvckhhbmRsZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyBoYW5kbGUoZXJyb3I6IHVua25vd24pOiBFcnJvcldpdGhDb2RlIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBpdCdzIG5vdCBhbiBlcnJvciBvYmplY3QsIGNvbnZlcnQgaXQgdG8gb25lXHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycgPyBlcnJvciA6IEpTT04uc3RyaW5naWZ5KGVycm9yKTtcclxuICAgICAgICByZXR1cm4gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9nIGFuZCBoYW5kbGUgQVBJIGVycm9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhbmRsZUFwaUVycm9yKGVycm9yOiB1bmtub3duKTogeyBzdGF0dXNDb2RlOiBudW1iZXI7IGJvZHk6IHN0cmluZyB9IHtcclxuICAgICAgICBjb25zdCBlcnIgPSB0aGlzLmhhbmRsZShlcnJvcik7XHJcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdBUEkgRXJyb3InLCBlcnIpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gKGVyciBhcyBFcnJvcldpdGhDb2RlKS5zdGF0dXNDb2RlIHx8IDUwMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3RhdHVzQ29kZSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiAoZXJyIGFzIEVycm9yV2l0aENvZGUpLmNvZGUgfHwgJ0lOVEVSTkFMX1NFUlZFUl9FUlJPUidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59Il19