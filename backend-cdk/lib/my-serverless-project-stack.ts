import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class MyServerlessProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2 // 最大アベイラビリティゾーン数
    });

    // RDSインスタンスの作成
    const dbInstance = new rds.DatabaseInstance(this, 'MyRdsInstance', {
      engine: rds.DatabaseInstanceEngine.mariaDb({
        version: rds.MariaDbEngineVersion.VER_10_5 // MariaDBのバージョン
      }),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('mariadb'), // 自動生成された秘密情報を使用
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // プライベートサブネット
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にRDSを削除
      deletionProtection: false,
      publiclyAccessible: false,
    });

    // Lambda関数の作成
    const myLambda = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_20_X, // Lambdaのランタイム
      code: lambda.Code.fromAsset('src/handlers'), // Lambda関数のコードを配置するディレクトリ
      handler: 'myLambda.handler', // ハンドラ関数
      environment: {
        DB_SECRET_NAME: dbInstance.secret?.secretName || '', // データベースの秘密情報
      },
      vpc,
    });

    // LambdaにRDSの秘密情報へのアクセス権を付与
    dbInstance.secret?.grantRead(myLambda);

    // API Gatewayの作成
    const api = new apigateway.LambdaRestApi(this, 'MyApiGateway', {
      handler: myLambda,
      proxy: false,
    });

    // API Gatewayにリソースとメソッドを追加
    const items = api.root.addResource('items');
    items.addMethod('GET');  // GET /items
    items.addMethod('POST'); // POST /items
  }
}
