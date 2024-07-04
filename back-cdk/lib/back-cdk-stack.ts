import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class LambdaApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda関数の作成
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      // Lambda関数の実行環境を指定（Node.js 16）
      runtime: lambda.Runtime.NODEJS_20_X, 
      // Lambda関数のエントリーポイントを指定
      handler: 'index.handler', 
      // Lambda関数のコードが格納されているディレクトリを指定
      code: lambda.Code.fromAsset('lambda'), 
    });

    // API Gatewayの作成
    const api = new apigateway.RestApi(this, 'MyApiGateway', {
      // API Gatewayの名前を指定
      restApiName: 'MyService', 
      // API Gatewayの説明を指定
      description: 'This service serves my Lambda function.', 
    });

    // Lambda統合の設定
    const getWidgetsIntegration = new apigateway.LambdaIntegration(lambdaFunction, {
      // リクエストテンプレートを指定
      requestTemplates: { 'application/json': '{"statusCode": 200}' }, 
    });

    // APIのルートにGETメソッドを追加し、Lambda関数にマッピング
    // GET /をLambda関数にマッピング
    api.root.addMethod('GET', getWidgetsIntegration); 
  }
}
