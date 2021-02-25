import * as pulumi from '@pulumi/pulumi';

const currentStack = pulumi.getStack().split('-')[1];
const resourceGroupStackRef = new pulumi.StackReference(`resource-group-${currentStack}`);
const appServicesStackRef = new pulumi.StackReference(`app-services-${currentStack}`);
const aksStackRef = new pulumi.StackReference(`aks-${currentStack}`);

export type StackConfig = {
  [key: string]: any;
};

export const config: StackConfig = {
  stack: currentStack,
  username: resourceGroupStackRef.getOutput('username'),
  cloudInfraNamespaceName: appServicesStackRef.getOutput("cloudInfraNamespaceName"),
  k8sProvider: appServicesStackRef.getOutput("k8sProvider"),
  acrServer : appServicesStackRef.getOutput("acrServer"),
  acrAdminUsername : appServicesStackRef.getOutput("acrAdminUsername"),
  acrAdminPassword : appServicesStackRef.getOutput("acrAdminPassword"),
  aksStackRef: aksStackRef.getOutput("aksStackRef"),
};
