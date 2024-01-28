import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

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

  }
}
