# Solar Data Service

This service collects, stores, and processes solar data from the Solcast API (or a mock API for development). It consists of an AWS Lambda function that pulls data at regular intervals, processes it, and stores it in a PostgreSQL database.

## Project Structure

```
solar-data-service/
│
├── cdk/                          # AWS CDK Infrastructure code
│   ├── bin/
│   │   └── cdk.ts                # CDK entry point
│   ├── lib/
│   │   └── solar-data-stack.ts   # Main CDK stack definition
│   ├── package.json
│   └── tsconfig.json
│
├── src/                          # Lambda function source code
│   ├── models/                   # Type definitions
│   ├── services/                 # Services for API and database
│   ├── utils/                    # Utilities
│   ├── config.ts                 # Configuration
│   ├── index.ts                  # Lambda handler
│   └── local.ts                  # Local development script
│
├── scripts/                      # Utility scripts
│   └── migrate.ts                # Database migration script
│
├── docker-compose.yml            # Local development environment
├── package.json
├── tsconfig.json
└── README.md                     # readme file
```

## Features

- Fetches solar radiation, weather, and PV power data from Solcast API (mock)
- Converts PV power from kW to W
- Stores data in PostgreSQL
- AWS Lambda function with scheduled execution (every hour)
- Error handling with retries
- Local development environment with Docker Compose
- AWS CDK for infrastructure as code

## Local Development Setup

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- AWS CLI configured with appropriate permissions (for deployment)
- TypeScript

### Setting Up the Local Environment

1. Clone the repository:

   ```
   git clone https://github.com/[username]/solar-data-service.git
   cd solar-data-service
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the local PostgreSQL database:

   ```
   docker-compose up -d
   ```

4. Create a `.env` file in the project root with the following content:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=soltrak
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_SSL_ENABLED=false
   LOG_LEVEL=debug
   ```

5. Run the migration script to set up the database schema:

   ```
   npx ts-node scripts/migrate.ts
   ```

6. Build the TypeScript code:

   ```
   npm run build
   ```

7. Run the local script to test data collection:
   ```
   npm run start:local
   ```
   or
   ```
   npx ts-node src/local.ts
   ```

### Using PgAdmin

The local environment includes PgAdmin for database management:

1. Access PgAdmin at http://localhost:5050
2. Login with:
   - Email: admin@example.com
   - Password: admin
3. Add a new server:
   - Name: Solar Data Local
   - Host: postgres
   - Port: 5432
   - Database: soltrak
   - Username: postgres
   - Password: postgres

## Deployment

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured
- Node.js 18 or higher

### Deploying with AWS CDK

1. Navigate to the CDK directory:

   ```
   cd cdk
   ```

2. Install CDK dependencies:

   ```
   npm install
   ```

3. Bootstrap your AWS environment (if not done already):

   ```
   npm run cdk:bootstrap
   ```

4. Synthesize the CloudFormation template:

   ```
   npm run cdk:synth
   ```

5. Create a package for your Lambda function:

   ```
   # From the project root
   mkdir -p lambda-package
   cp -r dist/* lambda-package/
   cp package.json lambda-package/
   cd lambda-package
   npm install --production
   cd ..
   ```

6. Deploy the stack:

   ```
   cd cdk
   npm run cdk:deploy
   ```

7. After deployment, the Lambda function URL will be displayed in the output.

## Deployed URL

The Lambda function is accessible at:

```
https://5ypbfntjrwk2z4h3crczmdrz7e0pdwma.lambda-url.eu-north-1.on.aws/
```

## API Endpoints

The Lambda function exposes the following HTTP endpoints:

- **POST /collect**: Manually triggers data collection

  ```
  curl -X POST https://5ypbfntjrwk2z4h3crczmdrz7e0pdwma.lambda-url.eu-north-1.on.aws/collect
  ```

- **GET /data**: Retrieves recent data from the database
  ```
  curl https://5ypbfntjrwk2z4h3crczmdrz7e0pdwma.lambda-url.eu-north-1.on.aws/data
  ```
  - Optional query parameter: `limit` (default: 48)
  ```
  curl https://5ypbfntjrwk2z4h3crczmdrz7e0pdwma.lambda-url.eu-north-1.on.aws/data?limit=10
  ```

## Error Handling Considerations

The system implements the following strategies to handle exceptions and ensure data reliability:

1. **API Resilience**:

   - Retry mechanism for API calls (3 attempts with exponential backoff)
   - Timeout settings to prevent hanging requests
   - Circuit breaker pattern to avoid cascading failures

2. **Data Integrity**:

   - Transactional database operations
   - Upsert logic to handle duplicate data
   - Schema validation for API responses

3. **Fallback Strategies for Missing Irradiance Data**:

   - Interpolation from historical data for short-term gaps
   - Alerts for persistent data issues
   - Use of alternative data sources when possible
   - Fallback to mock data generation when API is unavailable

4. **Monitoring and Alerting**:

   - CloudWatch Alarms for Lambda errors
   - Logging of all API interactions and data processing steps
   - Notification system for critical failures

5. **Data Quality Assurance**:
   - Validation of data ranges and consistency
   - Detection of outliers that might indicate sensor issues
   - Timestamps validation to ensure data coherence
