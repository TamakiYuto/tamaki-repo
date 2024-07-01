#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontCdkStack } from '../lib/front-cdk-stack';

const app = new cdk.App();
new FrontCdkStack(app, 'FrontCdkStack');
