import * as pulumi from '@pulumi/pulumi';

const currentStack = pulumi.getStack().split('-')[1];
const resourceGroupStackRef = new pulumi.StackReference(`resource-group-${currentStack}`);

export type StackConfig = {
  [key: string]: any;
};

export const config: StackConfig = {
  stack: currentStack,
  vnetRgName: resourceGroupStackRef.getOutput('vnetResourceGroupName'),
  username: resourceGroupStackRef.getOutput('username'),
};
