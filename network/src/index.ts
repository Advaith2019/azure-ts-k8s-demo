import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import { config } from "./config";

const username = 'karna';

// Create a Virtual Network for the cluster
const vnetName = `vnet-${config.stack}-aks-${username}`;

const vnet = new azure.network.VirtualNetwork(vnetName, {
    name: vnetName,
    resourceGroupName: config.vnetRgName,
    addressSpaces: ["10.4.0.0/16"],
});

// Create a Subnet for the cluster
const snName = `sn-${config.stack}-aks-${username}`;
const subnet = new azure.network.Subnet(snName, {
    name: snName,
    resourceGroupName: config.vnetRgName,
    virtualNetworkName: vnet.name,
    addressPrefix: "10.4.1.0/24",
});

export const subnetId = subnet.id