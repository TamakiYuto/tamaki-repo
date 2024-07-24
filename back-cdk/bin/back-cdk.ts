#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaApiGatewayStack } from '../lib/back-cdk-stack';

const app = new cdk.App();
new LambdaApiGatewayStack(app, 'LambdaApiGatewayStack');
