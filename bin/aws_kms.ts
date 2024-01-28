#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsKmsStack } from '../lib/aws_kms-stack';

const app = new cdk.App();
new AwsKmsStack(app, 'AwsKmsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});