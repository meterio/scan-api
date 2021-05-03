import BigNumber from 'bignumber.js';

import { BlockConcise } from './blockConcise.interface';

export interface TokenBalance {
  address: string;
  tokenAddress: string;
  balance: BigNumber;
  rank: number;

  lastUpdate: BlockConcise;
}
