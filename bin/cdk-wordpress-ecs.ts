#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkWordpressEcsStack } from '../lib/cdk-wordpress-ecs-stack';

const app = new cdk.App();
new CdkWordpressEcsStack(app, 'CdkWordpressEcsStack');
