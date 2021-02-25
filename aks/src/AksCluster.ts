import * as pulumi from '@pulumi/pulumi';
import * as azure from '@pulumi/azure';
import { StackConfig } from '../config';

export type AksClusterOutput = {
  [key: string]: pulumi.Output<string | undefined>;
};

export class AksCluster {
  config: StackConfig;

  nodePoolName: pulumi.Input<string>;

  clusterName: string;

  nodeRgName: pulumi.Input<string>;

  clusterType = 'VirtualMachineScaleSets';

  constructor(config: StackConfig) {
    this.config = config;
    this.nodePoolName = `pool${this.config.stack}`;
    this.clusterName = `aks-${this.config.stack}-3se`;
    this.nodeRgName = `rg-${this.config.stack}-aks-vmss-3se`;
  }

  populateRbac = (): pulumi.Input<
    azure.types.input.containerservice.KubernetesClusterRoleBasedAccessControl
  > => ({
    enabled: true,
  });

  populateDefaultNodePool = (): pulumi.Input<
    azure.types.input.containerservice.KubernetesClusterDefaultNodePool
  > => ({
    enableAutoScaling: this.config.clusterConfig.agentPoolProfile
      .enableAutoScaling,
    enableNodePublicIp: this.config.clusterConfig.agentPoolProfile
      .enableNodePublicIp,
    maxCount: this.config.clusterConfig.agentPoolProfile.maxCount,
    maxPods: this.config.clusterConfig.agentPoolProfile.maxPods,
    minCount: this.config.clusterConfig.agentPoolProfile.minCount,
    name: this.nodePoolName,
    nodeCount: this.config.clusterConfig.agentPoolProfile.nodeCount,
    osDiskSizeGb: this.config.clusterConfig.agentPoolProfile.osDiskSizeGb,
    type: this.clusterType,
    vmSize: this.config.clusterConfig.agentPoolProfile.vmSize,
    vnetSubnetId: this.config.subnetId,
  });

  populateNetworkProfile = (): pulumi.Input<
    azure.types.input.containerservice.KubernetesClusterNetworkProfile
  > => ({
    loadBalancerSku: this.config.clusterConfig.networkProfile.loadBalancerSku,
    networkPlugin: 'azure',
    networkPolicy: 'azure',
  });

  createAksCluster = (): AksClusterOutput => {
    let clusterId: pulumi.Output<string> = pulumi.output('N/A');
    let clusterName: pulumi.Output<string> = pulumi.output('N/A');
    let principalId: pulumi.Output<string | undefined> = pulumi.output('N/A');
    let kubeConfig: pulumi.Output<string> = pulumi.output('N/A');
    let kubeAdminConfig: pulumi.Output<string> = pulumi.output('N/A');

    const cluster = new azure.containerservice.KubernetesCluster(
    this.clusterName,
    {
      defaultNodePool: this.populateDefaultNodePool(),
      dnsPrefix: this.clusterName,
      identity: {
        type: 'SystemAssigned',
      },
      kubernetesVersion: this.config.clusterConfig.kubernetesVersion,
      location: this.config.location,
      name: this.clusterName,
      networkProfile: this.populateNetworkProfile(),
      nodeResourceGroup: this.nodeRgName,
      resourceGroupName: this.config.aksRgName,
      roleBasedAccessControl: this.populateRbac(),
    },
    {
      ignoreChanges: ['windowsProfile.admin_password'],
    },
    );

    clusterId = cluster.id;
    clusterName = cluster.name;
    principalId = cluster.identity.apply(identity => identity?.principalId);
    kubeConfig = cluster.kubeConfigRaw;
    kubeAdminConfig = cluster.kubeAdminConfigRaw;

    return {
      clusterId,
      clusterName,
      kubeAdminConfig,
      kubeConfig,
      principalId,
    };
  };
}
