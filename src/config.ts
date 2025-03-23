import { SecretsManager } from 'aws-sdk';

// Interface for database credentials retrieved from Secrets Manager
interface DatabaseCredentials {
  username: string;
  password: string;
}

let dbCredentials = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

// Function to get database credentials from Secrets Manager
async function getDbCredentialsFromSecretManager(): Promise<DatabaseCredentials> {
  const secretsManager = new SecretsManager();
  const secretArn = process.env.DB_CREDENTIALS_SECRET_ARN;

  if (!secretArn) {
    console.log('No secret ARN provided, using environment variables');
    return {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }

  try {
    console.log(`Retrieving secret from Secrets Manager: ${secretArn}`);
    const secretResponse = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();

    if (!secretResponse.SecretString) {
      throw new Error('Secret string is empty');
    }

    const secret = JSON.parse(secretResponse.SecretString);
    console.log('Successfully retrieved database credentials from Secrets Manager');

    return {
      username: secret.username,
      password: secret.password
    };
  } catch (error) {
    console.error('Error retrieving secret from Secrets Manager:', error);
    // Fallback to environment variables
    return {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }
}

// Initialize config with default values
export const config = {
  // Database configuration
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: process.env.DB_NAME || 'soltrak',
  dbUser: dbCredentials.username,
  dbPassword: dbCredentials.password,
  dbSslEnabled: process.env.DB_SSL_ENABLED === 'true',

  // Credentials management
  dbCredentialsSecretArn: process.env.DB_CREDENTIALS_SECRET_ARN,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Function to initialize credentials - call this before using the database
export async function initializeConfig(): Promise<void> {
  try {
    // Only fetch from Secrets Manager if running in AWS (not local)
    if (process.env.DB_CREDENTIALS_SECRET_ARN) {
      dbCredentials = await getDbCredentialsFromSecretManager();
      // Update config with retrieved credentials
      config.dbUser = dbCredentials.username;
      config.dbPassword = dbCredentials.password;
      console.log('Database configuration updated with credentials from Secrets Manager');
    }
  } catch (error) {
    console.error('Failed to initialize config with secrets:', error);
  }
}