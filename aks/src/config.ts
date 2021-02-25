import * as pulumi from '@pulumi/pulumi';

export interface AgentPoolProfile {
  vmSize: string;
  nodeCount: number;
  minCount: number;
  maxCount: number;
  osDiskSizeGb: number;
  maxPods: number;
  enableAutoScaling: boolean;
  enableNodePublicIp: boolean;
}
export interface NetworkProfile {
  loadBalancerSku: string;
}
export interface ClusterConfig {
  kubernetesVersion: string;
  agentPoolProfile: AgentPoolProfile;
  networkProfile: NetworkProfile;
}

export type StackConfig = {
  [key: string]: any;
};

const pulumiConfig = new pulumi.Config();
const currentStack = pulumi.getStack().split('-')[1];
const resourceGroupStackRef = new pulumi.StackReference(`resource-group-${currentStack}`);
const networkStackRef = new pulumi.StackReference(`network-${currentStack}`);

export const config: StackConfig = {
  stack: currentStack,
  location: resourceGroupStackRef.getOutput('location'),
  aksRgName: resourceGroupStackRef.getOutput('aksResourceGroupName'),
  username: resourceGroupStackRef.getOutput('username'),
  subnetId: networkStackRef.getOutput('subnetId'),
  clusterConfig: pulumiConfig.requireObject<ClusterConfig>('cluster'),
};
