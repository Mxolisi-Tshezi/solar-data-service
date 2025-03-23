import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, ScheduledEvent } from 'aws-lambda';
/**
 * Lambda handler for scheduled events (cron jobs)
 */
export declare const scheduledHandler: (event: ScheduledEvent, context: Context) => Promise<void>;
/**
 * Lambda handler for API Gateway HTTP API events
 * This provides an endpoint to trigger collection manually and retrieve data
 */
export declare const apiHandler: (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;
export declare const handler: (event: any, context: Context) => Promise<any>;
