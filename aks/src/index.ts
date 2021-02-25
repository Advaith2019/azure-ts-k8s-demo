import { config } from './config';
import { AksCluster } from './AksCluster';

const { clusterId, clusterName, principalId, kubeConfig } = new AksCluster(
  config,
).createAksCluster();

export = async () => ({
  aksClusterId: clusterId,
  aksClusterName: clusterName,
  aksPrincipalId: principalId,
  aksConfigRaw: kubeConfig,
});
