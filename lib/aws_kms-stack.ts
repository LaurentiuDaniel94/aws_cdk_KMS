import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class AwsKmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create KMS Key to encrypt S3 Bucket
    const testKmsKey = new kms.Key(this, "testKmsKey", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pendingWindow: cdk.Duration.days(7),
      alias: "alias/testKey",
      description: "Test KMS Key",
      enableKeyRotation: false,
    })

    //Create s3 Bucket for file storage
    const s3BucketKMS = new s3.Bucket(this, "testS3BucketKMS", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: testKmsKey,
    });

    //Create dynamoDB table for file metadata
    const dynamoDBMetadataTable = new dynamodb.Table(this, "dynamoDBMetadataTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      }
    })

    //Create IAM Role for Lambda to access S3 Bucket, DynamoDB Table, and KMS Key
    const lambdaRole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      ],
    })

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "s3:*",
      ],
      resources: [
        s3BucketKMS.bucketArn,
      ]
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement( {
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:*"
      ],
      resources: [
        dynamoDBMetadataTable.tableArn
      ],
    }));

    //Create Lambda Function to upload files to S3 Bucket and metadata to DynamoDB Table
    const uploadFileLambdaFunction = new lambda.Function(this, "uploadFileLambdaFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "main.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lib/assets/lambda/uploadLambda")),
      role: lambdaRole,
      environment: {
        "BUCKET_NAME": s3BucketKMS.bucketName,
        "TABLE_NAME": dynamoDBMetadataTable.tableName,
      }
    })

    //Create Lambda Function to download files from S3 Bucket and metadata from DynamoDB Table
    const downloadFileLambdaFunction = new lambda.Function(this, "downloadFileLambdaFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "main.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lib/assets/lambda/downloadLambda")),
      role: lambdaRole,
      environment: {
        "BUCKET_NAME": s3BucketKMS.bucketName,
        "TABLE_NAME": dynamoDBMetadataTable.tableName,
      }
    });
  }
}
