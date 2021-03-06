import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { CfnDBCluster, CfnDBSubnetGroup } from '@aws-cdk/aws-rds';
import cdk = require('@aws-cdk/core');
import { CfnFileSystem, CfnMountTarget } from '@aws-cdk/aws-efs';

export class CdkWordpressEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3, // Default is all AZs in region
      cidr: '10.0.0.0/16',
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, "AuroraSG", {
      vpc: vpc,
      description: 'Aurora DB Security Group'
    });

    const subnetIds: string[] = [];
    vpc.privateSubnets.forEach((subnet, index) => {
      subnetIds.push(subnet.subnetId);
    });

    const dbSubnetGroup: CfnDBSubnetGroup = new CfnDBSubnetGroup(this, 'AuroraSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group to access aurora',
      dbSubnetGroupName: 'aurora-serverless-subnet-group',
      subnetIds
    });

    const aurora = new CfnDBCluster(this, 'AuroraServerless', {
      databaseName: 'wordpress',
      dbClusterIdentifier: 'aurora-serverless',
      engine: 'aurora',
      engineMode: 'serverless',
      masterUsername: 'wordpress',
      masterUserPassword: 'wordpress',
      port: 3306,
      dbSubnetGroupName: dbSubnetGroup.dbSubnetGroupName,
      vpcSecurityGroupIds: [dbSecurityGroup.securityGroupId],
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: 2,
        minCapacity: 1,
        secondsUntilAutoPause: 600
      }
    });
    //wait for subnet group to be created
    aurora.addDependsOn(dbSubnetGroup);

    const auroraEndpoint = aurora.attrEndpointAddress

    new CfnOutput(this, 'AuroraClusterEndPoint', {
      value: auroraEndpoint
    });

    const efs = new CfnFileSystem(this, 'EcsEfs', {
      encrypted: true,
    });
    new CfnOutput(this, 'EfsFileSystemId', {
      value: efs.getAtt('FileSystemId')
    });

    const efs_mount1 = new CfnMountTarget(this, 'EcsEfsMount', {
      fileSystemId: 'fs-dff59514',
      subnetId: vpc.privateSubnets[0].subnetId,
      securityGroups: [dbSecurityGroup.securityGroupId]
    });

    const asg = new autoscaling.AutoScalingGroup(this, 'MyFleet', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      machineImage: new ecs.EcsOptimizedAmi(),
      updateType: autoscaling.UpdateType.REPLACING_UPDATE,
      desiredCapacity: 2,
      vpc,
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    cluster.addAutoScalingGroup(asg);
    asg.connections.allowTo(dbSecurityGroup, ec2.Port.tcp(3306), "allow ecs to connect to aurora")

    new ecs_patterns.ApplicationLoadBalanceAdEc2Service(this, 'Service', {
      cluster,
      memoryLimitMiB: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('wordpress'),
        environment: {
          WORDPRESS_DB_HOST: auroraEndpoint + ":3306",
          WORDPRESS_DB_USER: "wordpress",
          WORDPRESS_DB_PASSWORD: "wordpress",
          WORDPRESS_DB_NAME: "wordpress",
        },
      },
      desiredCount: 2,
    });
    cluster.connections.addSecurityGroup(dbSecurityGroup)
  }
}
