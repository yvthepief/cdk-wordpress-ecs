# AWS CDK WordPress ECS HA

With this repository it is possible to use AWS CDK to deploy a WordPress HA container platform. 
This setup will deploy a VPC with public and private subnets. Everything is based on best practices of AWS.

## Public Subnets
In the public subnets an application loadbalancer (ALB) will be deployed with a security group open for the world.

## Private Subnets
In the private subnets an AUTOSCALING group is created to host an ECS EC2 cluster. This cluster excist of two EC2 t3.medium hosts deployed in two seperate Availability Zones. On this ECS cluster two WordPress containers are deployed. As database for WordPress an AURORA Serverless database cluster is used.

# TO DO's:
## CODE:
- Create EFS share for sharing WordPress files between containers
- Allow security group of ECS EC2 host to connect to Aurora database
- Adjust loadbalancer with path based routing so 1 container will be used as MASTER
- Create S3 bucket for static content WordPress
- Create Cloudfront distribution
- Add WAF with WordPress rules
- Setup Route 53 records
- Create ACM certificates

## DOCUMENTATION
- Add diagram

# To Deploy Code:
1. Checkout this git code
2. Setup access with AWS
3. Install prerequisits:
```
npm install @aws-cdk/core @aws-cdk/aws-autoscaling @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecs-patterns @aws-cdk/aws-rds
```

4. Start build:
``` 
npm run build
```
5. Check CDK Synth:
``` 
cdk synth 
```
6. Deploy:
``` 
cdk deploy 
```

# To clean up:
1. Run destroy command
``` 
cdk destroy 
```

# Useful commands
 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
