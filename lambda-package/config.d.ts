export declare const config: {
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
    dbSslEnabled: boolean;
    dbCredentialsSecretArn: string | undefined;
    logLevel: string;
};
export declare function initializeConfig(): Promise<void>;
