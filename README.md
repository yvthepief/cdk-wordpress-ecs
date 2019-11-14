# AWS CDK Wordpress ECS

With this repository it is possible to use AWS CDK to deploy a VPC with public and private subnets. 
In the public subnets a loadbalancer will be deployed. In the private subnets EC2 hosts via an AUTOSCALING group and an AURORA Serverless database cluster is deployed. 
The EC2 hosts are used to create a ECS Cluster to deploy a wordpress container (2x) from docker hub on. 

# TO DO's:
- Create EFS share for wordpress files
- Allow security group of ECS EC2 host to connect to Aurora database
- Add diagram

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
