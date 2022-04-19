export * from './address';
export * from './abi';
export * from './model';
export * from './presets';

export const enumVals = (es: any) => {
  return Object.keys(es).map((key) => es[key] as string);
};
import { parseNetwork } from '@meterio/scan-db/dist';

export const RECENT_WINDOW = 5;
export const LIMIT_WINDOW = 10;
export const UNIT_SHANNON = 1e9;
export const UNIT_WEI = 1e18;

const { network, standby, consts, restfulEndpoint } = parseNetwork(
  process.env.NETWORK
);
export const getEnvNetwork = () => parseNetwork(process.env.NETWORK);
export const ENERGY_SYM = consts.energySym;
export const BALANCE_SYM = consts.balanceSym;
export const CHAIN_ID = consts.chainId;
export const STANDBY = standby;
export const NETWORK = network;
export const RESTFUL_ENDPOINT = restfulEndpoint;
