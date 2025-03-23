#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SolarDataStack } from '../lib/solar-data-stack';

const app = new cdk.App();
new SolarDataStack(app, 'SolarDataStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
    },
    description: 'Solar data collection and processing service'
});