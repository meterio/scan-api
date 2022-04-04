import { Network } from '@meterio/scan-db/dist';

export const getEnvNetwork = () => {
  let network: Network;
  switch (process.env.NETWORK) {
    case 'mainnet':
      network = Network.MainNet;
      break;
    case 'testnet':
      network = Network.TestNet;
      break;
    case 'main-standby':
      network = Network.MainNetStandBy;
      break;
    case 'test-standby':
      network = Network.TestNetStandBy;
      break;
  }
  return network;
};
