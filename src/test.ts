import BigNumber from 'bignumber.js';

import { commaSeparated } from './utils/utils';

const x = '199274229411764724000';
console.log(`${commaSeparated(x)}`);

const y = '1.22345662';
console.log(`${commaSeparated(y)}`);

const z = '192292929292929.22345662';
console.log(`${commaSeparated(z)}`);

const m = '0.22345662189283888228';
console.log(`${commaSeparated(m)}`);

const j = '1023945120943092184309';
console.log(commaSeparated(j));
