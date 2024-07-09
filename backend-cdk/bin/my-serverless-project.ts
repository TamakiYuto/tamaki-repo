#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyServerlessProjectStack } from '../lib/my-serverless-project-stack';

const app = new cdk.App();
new MyServerlessProjectStack(app, 'MyServerlessProjectStack', {
  env: {
    account: '654654268093', // AWSアカウントID
    region: 'ap-northeast-1' // デプロイ先のリージョン
  }
});
