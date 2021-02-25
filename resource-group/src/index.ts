import ResourceGroup from './ResourceGroup';
import { config } from './config';
import * as Constants from './constant';

const rg = new ResourceGroup(config);

export = async () => ({
  // General
  username: config.username,
  // Resource Groups
  vnetResourceGroupName: rg.createResourceGroup(Constants.RESOURCE_GROUP.VNET),
  aksResourceGroupName: rg.createResourceGroup(Constants.RESOURCE_GROUP.AKS),
  acrResourceGroupName: rg.createResourceGroup(Constants.RESOURCE_GROUP.ACR),
});
