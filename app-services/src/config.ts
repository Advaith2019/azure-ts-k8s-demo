import * as pulumi from '@pulumi/pulumi';

export interface ResourceConfig {
  cpu: string;
  memory: string;
}

export interface ResourcesConfig {
  limits: ResourceConfig;
  requests: ResourceConfig;
}

export interface NginxIngressBaseConfig {
  name: string;
  version: string;
  repo: string;
  resources: ResourcesConfig;
}

export interface NginxIngressConfig extends NginxIngressBaseConfig {
  loadBalancerIP: string;
  annotations: pulumi.Input<{ [key: string]: string }>;
}

export interface NginxIngressContext extends NginxIngressBaseConfig {
  namespace: pulumi.Output<any> | string;
}

export interface NginxIngressStackConfig {
  stack: string;
  chart: NginxIngressContext;
  loadBalancerIP: string;
  annotations: pulumi.Input<{ [key: string]: string }>;
  aksConfigRaw: pulumi.Output<any>;
  acrRgName: pulumi.Output<any>;
}

const pulumiConfig = new pulumi.Config();
const currentStack = pulumi.getStack().split('-')[2];
const aksStackRef = new pulumi.StackReference(`aks-${currentStack}`);
const resourceGroupStackRef = new pulumi.StackReference(`resource-group-${currentStack}`);

const nginxIngressConfig = pulumiConfig.requireObject<
  NginxIngressConfig
>('ingress-nginx');

export const config: NginxIngressStackConfig = {
  stack: currentStack,
  annotations: nginxIngressConfig.annotations || {
    'service.beta.kubernetes.io/azure-load-balancer-internal': 'true',
  },
  chart: {
    name: nginxIngressConfig.name || 'ingress-nginx',
    namespace: 'ingress-nginx',
    repo:
      nginxIngressConfig.repo ||
      'https://kubernetes.github.io/ingress-nginx',
    version: nginxIngressConfig.version || '3.22.0',
    resources: nginxIngressConfig.resources,
  },
  loadBalancerIP: nginxIngressConfig.loadBalancerIP,
  aksConfigRaw: aksStackRef.getOutput("aksConfigRaw"),
  acrRgName: resourceGroupStackRef.getOutput('acrResourceGroupName'),
};
