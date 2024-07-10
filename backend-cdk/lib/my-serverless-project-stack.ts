import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class MyServerlessProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
    });

    // // RDSインスタンスの作成 (MariaDB)
    // const rdsInstance = new rds.DatabaseInstance(this, 'MyRdsInstance', {
    //   engine: rds.DatabaseInstanceEngine.mariaDb({
    //     version: rds.MariaDbEngineVersion.VER_10_5,
    //   }),
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
    //   vpc,
    //   multiAz: false,
    //   allocatedStorage: 20,
    //   storageType: rds.StorageType.GP2,
    //   deletionProtection: false,
    //   databaseName: 'mydatabase',
    //   credentials: rds.Credentials.fromGeneratedSecret('admin'),
    //   publiclyAccessible: false,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //   },
    // });

    // Lambda関数の作成
    const myLambda = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        // RDS_HOSTNAME: rdsInstance.dbInstanceEndpointAddress,
        RDS_DB_NAME: 'mydatabase',
        RDS_USERNAME: 'admin',
        // RDS_PASSWORD: rdsInstance.secret?.secretValueFromJson('password')?.toString() ?? '',
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // API Gatewayの作成
    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'My Service',
      description: 'This service serves my Lambda function.',
    });

    const getWidgetsIntegration = new apigateway.LambdaIntegration(myLambda, {
      requestTemplates: { 'application/json': '{"statusCode": 200}' },
    });

    api.root.addMethod('GET', getWidgetsIntegration);
  }
}
