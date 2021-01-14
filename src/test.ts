import BigNumber from 'bignumber.js';

import { fromWei } from './utils/utils';

const x = new BigNumber('199274229411764724000');
console.log(`${fromWei(x, 6)}`);
