import * as azure from '@pulumi/azure';
import * as pulumi from '@pulumi/pulumi';
import * as Constants from './constant';
import { StackConfig } from './config';

export default class ResourceGroup {
  config: StackConfig;

  constructor(config: StackConfig) {
    this.config = config;
  }

  create = async (
    resourceGroupName: string,
  ): Promise<azure.core.GetResourceGroupResult | azure.core.ResourceGroup> => {
    const rgName = `${Constants.RG}-${this.config.stack}-${resourceGroupName}-${this.config.username}`;
    
    return new Promise<azure.core.ResourceGroup>(resolve => {
      resolve(
        new azure.core.ResourceGroup(rgName, {
          location: this.config.location,
          name: rgName,
        }),
      );
    });
  };

  createResourceGroup = async (
    resourceGroupType: string,
  ): Promise<pulumi.Output<string> | string> => {
    switch (resourceGroupType) {
      case Constants.RESOURCE_GROUP.VNET:
      case Constants.RESOURCE_GROUP.AKS:
      case Constants.RESOURCE_GROUP.ACR:
        const resourceGroup = await this.create(resourceGroupType);
        return resourceGroup.name;
      default:
        throw new Error('Invalid resource group type provided!!!');
    }
  };
}
