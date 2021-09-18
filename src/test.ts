import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';
import BigNumber from 'bignumber.js';

import { downloadBinary, getVersionList } from './utils/downloader';

// import { commaSeparated } from './utils/utils';

// const x = '199274229411764724000';
// console.log(`${commaSeparated(x)}`);

// const y = '1.22345662';
// console.log(`${commaSeparated(y)}`);

// const z = '192292929292929.22345662';
// console.log(`${commaSeparated(z)}`);

// const m = '0.22345662189283888228';
// console.log(`${commaSeparated(m)}`);

// const j = '1023945120943092184309';
// console.log(commaSeparated(j));

// (async () => {
//   const list = await getVersionList();
//   const picked = list.builds[3];
//   const { path, version, keccak256 } = picked;

//   await downloadBinary(`/tmp/${version}.js`, path, keccak256);
// })();

(async () => {
  const address = '0x8A419EF4941355476CF04933E90BF3BBF2F73814';
  const version = '0.6.9';
  const optimizer = '1';
  // const sourceCode = fs
  // .readFileSync(path.join(__dirname, 'Storage.sol'))
  // .toString();
  const sourceCode = `// SPDX-License-Identifier: GPL-3.0

  pragma solidity >=0.6.9;
  
  contract Storage {
    uint256 number;
  
    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
      number = num;
    }
  
    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256) {
      return number;
    }
  }
  `;
  console.log('ready to post');
  const res = await axios.post(
    `https://api.meter.io:4000/api/accounts/${address}/verify`,
    { version, optimizer, sourceCode }
  );
  console.log('posted');
  if (res.status == 200) {
    console.log(res.data);
  } else {
    console.log('status: ', res.status);
    console.log('error: ', res);
  }
})();
