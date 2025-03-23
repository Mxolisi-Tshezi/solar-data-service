export const config = {
    // Database configuration
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbName: process.env.DB_NAME || 'soltrak',
    dbUser: process.env.DB_USER || 'postgres',
    dbPassword: process.env.DB_PASSWORD || 'postgres',
    dbSslEnabled: process.env.DB_SSL_ENABLED === 'true',
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info'
  };