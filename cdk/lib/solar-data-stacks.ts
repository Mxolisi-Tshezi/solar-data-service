import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

export class SolarDataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC for our resources
    const vpc = new ec2.Vpc(this, 'SolarDataVpc', {
      maxAzs: 2,
      natGateways: 1
    });

    // Create a security group for the database
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Allow database access from Lambda functions',
      allowAllOutbound: true
    });

    // Create a security group for the Lambda function
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true
    });

    // Allow Lambda to connect to the database
    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    );

    // Create database credentials in Secrets Manager
    const databaseCredentials = new secretsmanager.Secret(this, 'DbCredentials', {
      secretName: 'solar-data-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '/@"',
      },
    });

    // Create the PostgreSQL database
    const database = new rds.DatabaseInstance(this, 'SolarDataDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.SMALL
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'soltrak',
      credentials: rds.Credentials.fromSecret(databaseCredentials),
      backupRetention: Duration.days(7),
      deletionProtection: false, // Set to true for production
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
    });

    // Create the Lambda function
    // const lambdaFunction = new lambda.Function(this, 'SolarDataLambda', {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('../lambda-package'), // Compiled TypeScript
    //   vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
    //   },
    //   securityGroups: [lambdaSecurityGroup],
    //   timeout: Duration.seconds(30),
    //   memorySize: 256,
    //   environment: {
    //     DB_HOST: database.dbInstanceEndpointAddress,
    //     DB_PORT: database.dbInstanceEndpointPort,
    //     DB_NAME: 'soltrak',
    //     // Instead of using SecretValue directly, we'll use the secret ARN
    //     DB_CREDENTIALS_SECRET_ARN: databaseCredentials.secretArn,
    //     DB_SSL_ENABLED: 'true',
    //     LOG_LEVEL: 'info'
    //   },
    //   logRetention: logs.RetentionDays.ONE_WEEK,
    //   description: 'Lambda function to collect and process solar data from Solcast API'
    // });

    // // Grant Lambda function access to database credentials
    // databaseCredentials.grantRead(lambdaFunction);


    // Section of solar-data-stack.ts that needs updating

    // Create the Lambda function
    const lambdaFunction = new lambda.Function(this, 'SolarDataLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda-package'), // Using our packaged code
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      securityGroups: [lambdaSecurityGroup],
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        DB_HOST: database.dbInstanceEndpointAddress,
        DB_PORT: database.dbInstanceEndpointPort,
        DB_NAME: 'soltrak',
        // Only pass the secret ARN, not the secret values directly
        DB_CREDENTIALS_SECRET_ARN: databaseCredentials.secretArn,
        DB_SSL_ENABLED: 'true',
        LOG_LEVEL: 'info'
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'Lambda function to collect and process solar data from Solcast API'
    });

    // Grant Lambda function access to database credentials
    databaseCredentials.grantRead(lambdaFunction);


    // Set up CloudWatch Events rule to trigger Lambda every hour
    const rule = new events.Rule(this, 'HourlySchedule', {
      schedule: events.Schedule.expression('cron(0 * * * ? *)'), // Run every hour at minute 0
      description: 'Trigger solar data collection every hour'
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));

    // Create Lambda Function URL for public access
    const functionUrl = lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Public access
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.POST],
        allowedHeaders: ['*']
      }
    });

    // Output the function URL
    new cdk.CfnOutput(this, 'LambdaFunctionUrl', {
      value: functionUrl.url,
      description: 'URL for the Lambda function',
      exportName: 'SolarDataLambdaUrl'
    });

    // Output the database endpoint
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'Endpoint of the PostgreSQL database',
      exportName: 'SolarDataDbEndpoint'
    });
  }
}