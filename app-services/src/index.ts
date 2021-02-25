import * as k8s from "@pulumi/kubernetes";
import * as azure from "@pulumi/azure";
import * as pulumi from "@pulumi/pulumi";
import { config } from "./config";

export const provider = new k8s.Provider("provider", {
    kubeconfig: config.aksConfigRaw,
});

const ingressNamespace = 'ingress-nginx';
const namespace = new k8s.core.v1.Namespace(
    ingressNamespace,
    {
      metadata: {
        labels: {
            'app.kubernetes.io/name': ingressNamespace,
            'app.kubernetes.io/part-of': ingressNamespace,
          },
          name: ingressNamespace,
      }
    },
    { provider },
);

// Deploy NGINX ingress controller using the Helm chart.
new k8s.helm.v2.Chart(config.chart.name,
    {
        namespace: config.chart.namespace,
        chart: config.chart.name,
        version: config.chart.version,
        fetchOpts: { repo: config.chart.repo },
        values: { controller: {publishService: {enabled: true}} },
        transformations: [
            (obj: any) => {
                // Do transformations on the YAML to set the namespace
                if (obj.metadata) {
                    obj.metadata.namespace = config.chart.namespace;
                }
            
                if (obj.kind === 'Service') {
                    if (obj.spec && obj.spec.type === 'LoadBalancer') {
                        obj.spec.externalTrafficPolicy = 'Local';
                        obj.spec.loadBalancerIP = config.loadBalancerIP;
                        obj.metadata.annotations = config.annotations;
                    }
                }
            
                if (obj.kind === 'Deployment') {
                    if (obj.spec.template.spec.containers[0].resources) {
                        obj.spec.template.spec.containers[0].resources.limits = {
                        cpu: config.chart.resources.limits.cpu,
                        memory: config.chart.resources.limits.memory,
                        }
            
                        obj.spec.template.spec.containers[0].resources.requests = {
                        cpu: config.chart.resources.requests.cpu,
                        memory: config.chart.resources.requests.memory,
                        }
                    }  
                }
            },
        ],
    },
    {
        providers: { kubernetes: provider },
        dependsOn: [ namespace ]
    },
);

// Create a registry in ACR.
const acrName = `acr${config.stack}3se`
const registry = new azure.containerservice.Registry(acrName, {
    name: acrName,
    resourceGroupName: config.acrRgName,
    sku: "Basic",
    adminEnabled: true,
});

// Create a k8s secret for use when pulling images from the container registry.
var dockerCfg = pulumi.all([registry.loginServer, registry.adminUsername, registry.adminPassword])
    .apply(([loginServer, adminUsername, adminPassword]) => {
        const regCredential: { [key: string]: object; } = {};
        regCredential[loginServer] = {
            'email': 'notneeded@acme.com',
            'username': adminUsername,
            'password': adminPassword,

        }
        return regCredential;
});

export const acrServer = registry.loginServer
export const acrAdminUsername = registry.adminUsername
export const acrAdminPassword = registry.adminPassword

export const dockerSecretData = dockerCfg.apply(x => {
    return Buffer.from(JSON.stringify(x)).toString('base64');
})

const cloudInfraNsName = 'cloud-infra';
const cloudInfraNamespace = new k8s.core.v1.Namespace(
    cloudInfraNsName,
    {
      metadata: {
        labels: {
            'app.kubernetes.io/name': cloudInfraNsName,
            'app.kubernetes.io/part-of': cloudInfraNsName,
          },
          name: cloudInfraNsName,
      }
    },
    { provider },
);

const secretName = 'regcred'
new k8s.core.v1.Secret( secretName,
    {
        data: {
        '.dockercfg': dockerSecretData,
        },
        metadata: {
            name: secretName,
            namespace: cloudInfraNamespace.metadata.name,
        },
        type: 'kubernetes.io/dockercfg',
    },
    { 
        provider,
    },
).id;


export const cloudInfraNamespaceName = cloudInfraNamespace.metadata.name
