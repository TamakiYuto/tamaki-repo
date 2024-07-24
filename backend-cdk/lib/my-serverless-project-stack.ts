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

       // RDSインスタンスを作成 (MariaDB)
       const rdsInstance = new rds.DatabaseInstance(this, 'MyRdsInstance', {
        engine: rds.DatabaseInstanceEngine.mariaDb({ version: rds.MariaDbEngineVersion.VER_10_5 }),
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        vpc,
        credentials: rds.Credentials.fromGeneratedSecret('admin'), // 管理者ユーザーの生成
        databaseName: 'MyDatabase',
        allocatedStorage: 20, // 20GBのストレージ
        maxAllocatedStorage: 100, // 最大100GBまで拡張可能
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にRDSインスタンスも削除
      });

     // Lambda関数を作成
     const myLambda = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/myLambda.handler',
      code: lambda.Code.fromAsset('src'),
      environment: {
        DATABASE_SECRET_ARN: rdsInstance.secret!.secretArn,
        DATABASE_NAME: 'MyDatabase',
      },
      vpc,
    });

     // RDSインスタンスへの接続許可をLambdaに付与
     rdsInstance.connections.allowDefaultPortFrom(myLambda);

    // API Gatewayを作成し、Lambda関数をエンドポイントとして設定
    new apigateway.LambdaRestApi(this, 'MyApi', {
      handler: myLambda,
    });
  }
}
