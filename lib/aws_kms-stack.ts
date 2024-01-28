import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";

export class AwsKmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create KMS Key
    const testKmsKey = new kms.Key(this, "testKmsKey", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pendingWindow: cdk.Duration.days(7),
      alias: "alias/testKey",
      description: "Test KMS Key",
      enableKeyRotation: false,
    })

    //Create s3 Bucket
    const s3BucketKMS = new s3.Bucket(this, "testS3BucketKMS", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: testKmsKey,
      bucketName: "test-s3-bucket-kms",
    });

  }
}
