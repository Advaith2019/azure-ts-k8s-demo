import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import * as docker from "@pulumi/docker";
import * as k8s from "@pulumi/kubernetes";
import { config } from "./config";
import NodeApp from "./NodeApp";

// Build a Docker image from a local Dockerfile context in the
// './node-app' directory, and push it to the registry.
const customImage = "node-app";
const appImage = new docker.Image(customImage, {
    imageName: pulumi.interpolate`${config.acrServer}/${customImage}:v1.0.0`,
    build: {
        context: `../${customImage}`,
    },
    registry: {
        server: config.acrServer,
        username: config.acrAdminUsername,
        password: config.acrAdminPassword,
    },
});

// Create a k8s provider.
const provider = new k8s.Provider("provider", {
    kubeconfig: config.aksStackRef,
});

export = async () => {
    return {
      regcredSecretId: new NodeApp().createDeployment(config, provider, appImage.imageName, appImage),
    };
  };
  








