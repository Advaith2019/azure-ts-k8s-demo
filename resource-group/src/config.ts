import * as pulumi from '@pulumi/pulumi';

const currentStack = pulumi.getStack().split('-')[2];

export type StackConfig = {
  [key: string]: any;
};

export const config: StackConfig = {
  // TODO: Change this to your username
  username: 'karna',
  stack: currentStack,
};
