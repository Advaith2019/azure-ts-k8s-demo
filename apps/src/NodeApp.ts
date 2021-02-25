import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { StackConfig } from './config';
import * as docker from '@pulumi/docker';

export default class NodeApp {
  createDeployment = (
    config: StackConfig, 
    provider: k8s.Provider,
    appImageName: pulumi.Output<string>,
    appImage: docker.Image,
  ): k8s.networking.v1beta1.Ingress => {
    const app = 'node-app';
    const deploymentName = app.concat('-deployment');
    const svcName = app.concat('-svc');
    const ingressName = app.concat('-ingress');
    const port = 8091;
    const labels = { app };
    const namespace = config.cloudInfraNamespaceName

    const deployment = new k8s.apps.v1.Deployment(
      deploymentName,
      {
        metadata: {
          name: deploymentName,
          namespace,
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: labels },
          template: {
            metadata: { labels },
            spec: {
              containers: [
                {
                  // TODO: Need to be fixed so it points private registry
                  image: appImageName,
                  name: app.concat('-container'),
                  ports: [{ containerPort: port }],
                  resources: { requests: { cpu: '50m', memory: '20Mi' } },
                  volumeMounts: [],
                },
              ],
              volumes: [],
            },
          },
        },
      },
      { 
        provider, 
        dependsOn : [ appImage ],
      },
    );

    const service = new k8s.core.v1.Service(
      svcName,
      {
        metadata: { name: svcName, namespace },
        spec: {
          ports: [{ port: 80, protocol: 'TCP', targetPort: port }],
          selector: labels,
        },
      },
      { 
        provider,
        dependsOn : [ appImage, deployment ]
      },
    );

    return new k8s.networking.v1beta1.Ingress(
      ingressName,
      {
        metadata: {
          annotations: {
            'kubernetes.io/ingress.class': 'nginx',
            'nginx.ingress.kubernetes.io/ssl-redirect': 'false',
          },
          name: ingressName,
          namespace,
        },
        spec: {
          rules: [
            {
              http: {
                paths: [
                  {
                    backend: {
                      serviceName: service.metadata.name,
                      servicePort: 80,
                    },
                    path: '/demo',
                  },
                ],
              },
            },
          ],
        },
      },
      { 
        provider,
        dependsOn : [ appImage, service ]
      },
    );
  };
}
