# Scan API

API service of Meter next generation Scan.

## API

- `GET /api/metrics/all` - Get all metrics for meter network
- `GET /api/metrics/pos` - Get PoS metrics
- `GET /api/metrics/pow` - Get PoW metrics
- `GET /api/metrics/head` - Get head metrics
- `GET /api/metrics/chart` - Get hashrate chart metrics
- `GET /api/validators/count` - Get validators count information
- `GET /api/validators/delegate?page=1&limit=10` - Get delegate validator information <sup>i</sup>
- `GET /api/validators/candidate?page=1&limit=10` - Get candidate validator information <sup>i</sup>
- `GET /api/validators/jailed?page=1&limit=10` - Get jailed validator information <sup>i</sup>
- `GET /api/validators/rewards?page=1&limit=10` - Get validator rewards information <sup>i</sup>
- `GET /api/search/:hash` - Search for tx/block/account
- `GET /api/accounts/:addr` - Get account summary
- `GET /api/accounts/:addr/txs?page=1&limit=10` - Get transactions of account <sup>i</sup>
- `GET /api/accounts/:addr/transfers?page=1&limit=10` - Get Token transfers of account <sup>i</sup>
- `GET /api/accounts/:addr/erc20txs?page=1&limit=10` - Get ERC20 transactions of account <sup>i</sup>
- `GET /api/accounts/:addr/buckets?page=1&limit=10` - Get buckets of account <sup>i</sup>
- `GET /api/accounts/:addr/proposed?page=1&limit=10` - Get proposed blocks of account <sup>i</sup>
- `GET /api/accounts/:addr/delegators?page=1&limit=10` - Get delegators of account <sup>i</sup>
- `GET /api/blocks/:revision` - Get block, revision can be `best`, `block number` or `block ID`
- `GET /api/blocks/:blockid/txs` - Get block transactions
- `GET /api/blocks/recent` - Get recent blocks
- `GET /api/txs/:txid` - Get transaction
- `GET /api/txs/recent` - Get recent transactions
- `GET /api/transfers/recent` - Get recent transfers
- `GET /api/pow/blocks/recent` - Get recent pow blocks
- `GET /api/pow/rewards?page=1&limit=10` - Get mining rewards information <sup>i</sup>
- `GET /api/auctions/present` - Get present auction <sup>\*</sup>
- `GET /api/auctions/past` - Get all past auctions <sup>\*</sup>

<b>i</b> : List API have the functionality of pagination, just specify `limit` and `page` as the URL parameter.
<b>\*</b> : List API under construction, use at your own risk.

## Sample Returns:

### GET /api/metrics/all

```javascript
{
  "mtrg": {
    "price": "0.29549",
    "priceChange": "-14.01%",
    "avgDailyReward": "235 MTRG",
    "circulation": "0"
  },
  "mtr": {
    "price": "0.408513",
    "priceChange": "0.69%",
    "circulation": "0"
  },
  "pos": {
    "best": 5907111,
    "kblock": 5906742,
    "epoch": 3491,
    "seq": 369
  },
  "staking": {
    "buckets": 1,
    "candidates": 1,
    "validators": 1,
    "delegates": 0,
    "onlineNodes": 0,
    "totalNodes": 0,
    "totalStaked": "400 MTRG"
  },
  "pow": {
    "best": 209817,
    "difficulty": "1.645202590751619",
    "hashrate": "119340470.7453398",
    "rewardPerDay": "0.12720000000223517424",
    "costParity": "1.46547677371980849682"
  }
}
```

### Get /api/metrics/pos

```js
{
  "pos": {
    "best": 5907062,
    "kblock": 5906742,
    "epoch": 3491,
    "seq": 320
  },
  "staking": {
    "buckets": 1,
    "candidates": 1,
    "validators": 1,
    "delegates": 0,
    "onlineNodes": 0,
    "totalNodes": 0,
    "totalStaked": "400 MTRG"
  }
}
```

### Get /api/metrics/pow

```js
{
  "mtr": {
    "price": "0.408513",
    "priceChange": "0.69%",
    "circulation": "0"
  },
  "pow": {
    "best": 209817,
    "difficulty": "1.645202590751619",
    "hashrate": 119340470.7453398,
    "rewardPerDay": "0.12720000000223517424",
    "costParity": "1.46547677371980849682"
  }
}
```

### GET /api/metrics/head

```json
{
  "heads": {
    "pos": 7,
    "pow": 10,
    "account": 8,
    "erc20": 30
  }
}
```

### GET /api/metrics/chart

```json
{
  "hashrates": {
    "mainnet": [
      [1610176050, "99150555.21346013"],
      [1610262450, "99150555.21346013"],
      [1610348850, "99150555.21346013"],
      [1610435250, "99150555.21346013"],
      [1610521650, "14943576.10785735"]
    ],
    "testnet": [
      [1610176050, "99150555.21346013"],
      [1610262450, "99150555.21346013"],
      [1610348850, "99150555.21346013"],
      [1610435250, "99150555.21346013"],
      [1610521650, "14943576.10785735"]
    ]
  }
}
```

### GET /api/validators/count

```json
{
  "totalStaked": "400 MTRG",
  "totalDelegateStaked": "400 MTRG",
  "onlineNode": 0,
  "totalNode": 0,
  "delegates": 1,
  "candidates": 1,
  "jailed": 0
}
```

### GET /api/validators/candidate

```json
{
  "total": 1,
  "candidates": [
    {
      "name": "Simon",
      "address": "0xbf85ef4216340eb5cd3c57b550aae7a2712d48d2",
      "netAddr": "18.138.202.36:8670",
      "pubKey": "BIRP8aFk7FHq8FTVk0auV0JrhYK8JvWfVITh+Z7GQdSWmXe4ovzUGsSe+pVd7KHtthISK//VnHO9LYGUlLNkREY=:::sjPxaUFgq+4F40NOyIxN5M8Tt8Y/CdLUmjoUyPNGXPmBzAJ+5bQjEQfPUo1zR9PdMOfAHTS2qN8HWWM8ZKX65AE=",
      "commission%": "10%",
      "totalVotes": "400 MTRG",
      "upTime": "100%"
    }
  ]
}
```

### GET /api/validators/delegate

```json
{
  "total": 1,
  "delegates": [
    {
      "name": "Simon",
      "address": "0xbf85ef4216340eb5cd3c57b550aae7a2712d48d2",
      "netAddr": "18.138.202.36:8670",
      "pubKey": "BIRP8aFk7FHq8FTVk0auV0JrhYK8JvWfVITh+Z7GQdSWmXe4ovzUGsSe+pVd7KHtthISK//VnHO9LYGUlLNkREY=:::sjPxaUFgq+4F40NOyIxN5M8Tt8Y/CdLUmjoUyPNGXPmBzAJ+5bQjEQfPUo1zR9PdMOfAHTS2qN8HWWM8ZKX65AE=",
      "votingPower": "1000 MTRG",
      "commission%": "10%",
      "shares": "2.34%",
      "upTime": "100%",
      "totalPoints": 1
    }
  ]
}
```

### GET /api/validators/jailed

```js
{
  "total": 1,
  "jailed": [
    {
      "name": "Simon",
      "address": "0xbf85ef4216340eb5cd3c57b550aae7a2712d48d2",
      "netAddr": "18.138.202.36:8670",
      "pubKey": "BIRP8aFk7FHq8FTVk0auV0JrhYK8JvWfVITh+Z7GQdSWmXe4ovzUGsSe+pVd7KHtthISK//VnHO9LYGUlLNkREY=:::sjPxaUFgq+4F40NOyIxN5M8Tt8Y/CdLUmjoUyPNGXPmBzAJ+5bQjEQfPUo1zR9PdMOfAHTS2qN8HWWM8ZKX65AE=",
      "totalPoints": 10,
      "bailAmount": "300 MTRG",
      "jailedTime": 1608360164,
      "infractions": {...},
      "upTime": "100%"
    }
  ]
}
```

### GET /api/validators/rewards

```json
{
  "rewards": [
    {
      "epoch": 1,
      "height": 200,
      "totalReward": "100000000000000000000",
      "baseReward": "1000000000000000000000000",
      "timestamp": 1593909279
    },
    {
      "epoch": 2,
      "height": 400,
      "totalReward": "100000000000000000000",
      "baseReward": "1000000000000000000000000",
      "timestamp": 1594809279
    }
  ]
}
```

### GET /api/search/:hash

```javascript
{
  "type": "block", // could be block/tx/account
  "data": {
    // block data
    // if type is tx, then this includes tx data
    // otherwise if type is account, this includes account data
  }
}
```

### GET /api/accounts/:addr

```json
{
  "account": {
    "address": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
    "mtrBalance": "5225377013682137246",
    "mtrgBalance": "0",
    "firstSeen": {
      "number": 440,
      "hash": "0x000001b8f5565911b8f517bbdcfeb7cdbe99c4f453e3f5540a2ce38bd9a7ae4f",
      "timestamp": 1593909279
    },
    "lastUpdate": {
      "number": 440,
      "hash": "0x000001b8f5565911b8f517bbdcfeb7cdbe99c4f453e3f5540a2ce38bd9a7ae4f",
      "timestamp": 1593909279
    },
    "createdAt": 1605708362,
    "updatedAt": 1605709292
  }
}
```

### GET /api/accounts/:addr/txs

```json
{
  "txSummaries": [
    {
      "hash": "0x6cafec49fcf66bf351b7c685391bafe4d5e829ae13745fb8b9a1903129bcf37d",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 127,
      "type": "reward",
      "paid": "1018500000000000000",
      "totalAmountStr": "0.000000803039579719 MTR",
      "feeStr": "1.0185 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0xa98794607f7d6dfa76c7480b00e21fde431c7e8ed52bf77306ab0bea01a1059a",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 200,
      "type": "reward",
      "paid": "1602500000000000000",
      "totalAmountStr": "0.0000012646292594 MTR",
      "feeStr": "1.6025 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0x512fac9c04971c3fa1fff473eadb8a807e837d344bc21a8c259176a71ce0ca2f",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 1,
      "type": "call",
      "paid": "19498000000000000",
      "totalAmountStr": "0 MTRG",
      "feeStr": "0.019498 MTR",
      "reverted": false,
      "tos": ["0x6163636f756e742d6c6f636b2d61646472657373"]
    }
  ]
}
```

### GET /api/accounts/:addr/erc20txs

```json
{
  "transfers": [
    {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "ERC20",
      "amount": "37338141289626210",
      "address": "0x......",
      "txHash": "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "block": {
        "number": 1310,
        "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
        "timestamp": 1593911333
      },
      "clauseIndex": 59,
      "logIndex": 0,
      "createdAt": 1605709292,
      "updatedAt": "1970-01-19T14:01:49.292Z"
    },
    {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "ERC20",
      "amount": "55752011887462802",
      "address": "0x.....",
      "txHash": "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "block": {
        "number": 1310,
        "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
        "timestamp": 1593911333
      },
      "clauseIndex": 50,
      "logIndex": 0,
      "createdAt": 1605709292,
      "updatedAt": "1970-01-19T14:01:49.292Z"
    }
  ]
}
```

### GET /api/accounts/:addr/buckets

```js
{
  "buckets": [
    {
      "owner": "0x0000000000000000000000000000000000000000",
      "candidate": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "MTR",
      "totalVotes": "37338141289626210",
      "bonusVotes": "123422122",
      "bounded": false,
      "createdTime": 1605709292,
      ...
    },
    {
      "owner": "0x0000000000000000000000000000000000000000",
      "candidate": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "MTR",
      "totalVotes": "37338141289626210",
      "bonusVotes": "123422122",
      "bounded": false,
      "createdTime": 1605709292,
      ...
    }
  ]
}
```

### GET /api/accounts/:addr/transfers

```json
{
  "transfers": [
    {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "MTR",
      "amount": "37338141289626210",
      "address": "",
      "txHash": "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "block": {
        "number": 1310,
        "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
        "timestamp": 1593911333
      },
      "clauseIndex": 59,
      "logIndex": 0,
      "createdAt": 1605709292,
      "updatedAt": "1970-01-19T14:01:49.292Z"
    },
    {
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
      "token": "MTR",
      "amount": "55752011887462802",
      "address": "",
      "txHash": "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "block": {
        "number": 1310,
        "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
        "timestamp": 1593911333
      },
      "clauseIndex": 50,
      "logIndex": 0,
      "createdAt": 1605709292,
      "updatedAt": "1970-01-19T14:01:49.292Z"
    }
  ]
}
```

### GET /api/accounts/:addr/proposed

```json
{
  "proposed": [
    {
      "number": 2750,
      "hash": "0x00000abe29b51019fa3c03c69b9bda59fa0110f7694a8374f399a4a13e56485d",
      "parentID": "0x00000abdb42de5826f0ee72b2f945b1a1d9936e2d4844f7970487f72dd825a8b",
      "timestamp": 1609932609,
      "txHashs": [],
      "lastKBlockHeight": 4,
      "epoch": 2,
      "qcHeight": 2749,
      "blockType": 0,
      "gasUsed": 0,
      "txCount": 0,
      "signer": "0x7c30d59ac6d36afde7769bf69f3a58a8a7d74fd0"
    },
    {
      "number": 2778,
      "hash": "0x00000abdb42de5826f0ee72b2f945b1a1d9936e2d4844f7970487f72dd825a8b",
      "parentID": "0x00000abceb8d420c7f3515559a4630e86be6bec86b2cf8270dc627ef21fc4192",
      "timestamp": 1609932606,
      "txHashs": [],
      "lastKBlockHeight": 4,
      "epoch": 2,
      "qcHeight": 2748,
      "blockType": 0,
      "gasUsed": 0,
      "txCount": 0,
      "signer": "0x7c30d59ac6d36afde7769bf69f3a58a8a7d74fd0"
    }
  ]
}
```

### GET /api/accounts/:addr/delegators

```json
{
  "delegators": [
    {
      "address": "0x7c30d59ac6d36afde7769bf69f3a58a8a7d74fd0",
      "amount": "200000000000"
    },
    {
      "address": "0x903f577c60796bac2bab28c71d1cb1fdc6c4c409",
      "amount": "300000000000"
    },
    {
      "address": "0x632cb15a35c4265ee043e0db9ccc35ef798b0532",
      "amount": "400000000000"
    }
  ]
}
```

### GET /api/blocks/:revision

```json
{
  "block": {
    "txHashs": [
      "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "0xf9d0180ef23ed6204d15e0296935782be2d29e2d031bffd8a06060b63b5db7d1"
    ],
    "number": 1310,
    "size": 21064,
    "parentID": "0x0000051d6aabb322d9587648dea09fc2c07a93d3811570a94a79abd7f577fd85",
    "timestamp": 1593911333,
    "gasLimit": 200000000,
    "beneficiary": "0x903f577c60796bac2bab28c71d1cb1fdc6c4c409",
    "gasUsed": 1003996,
    "totalScore": 1310,
    "txsRoot": "0x31afd61734696dda2b2b091d3feca9716b3aa738f5da32c1b011e0ffd8bda0e0",
    "stateRoot": "0x6bb47f2646d26a09b2966558ce4ce80d1f80ca429fec57b0515c9ba73630e796",
    "receiptsRoot": "0x7a6d936fd1d0129fe35aba8e2ab6597fe5332a44158ff88100bd00ed5850e93f",
    "signer": "0x632cb15a35c4265ee043e0db9ccc35ef798b0532",
    "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
    "reward": "501998000000000000",
    "gasChanged": 0,
    "score": 1,
    "txCount": 2,
    "blockType": "KBlock",
    "createdAt": 1605706563,
    "updatedAt": "1970-01-19T14:01:46.563Z"
  }
}
```

### GET /api/blocks/:blockid/txs

```json
{
  "txs": [
    {
      "hash": "0x120b7515abc6fadbb81e93aa8b7ba724ead688e8164840095a8ba8c4a6b418fe",
      "block": {
        "number": 1310,
        "hash": "0x0000051ee238e657eaef9dfeeb57bc047b58f0f99031462be25321d3f495b659",
        "timestamp": 1593911333
      },
      "txIndex": 0,
      "chainTag": 82,
      "blockRef": "0x0000051b00000000",
      "expiration": 720,
      "gasPriceCoef": 0,
      "gas": 4200000,
      "nonce": "0xbc614e",
      "dependsOn": null,
      "origin": "0x0000000000000000000000000000000000000000",
      "clauses": [
        {
          "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
          "value": "66283684122949440",
          "token": "MTR",
          "data": "0x"
        },
        {
          "to": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
          "value": "37338141289626210",
          "token": "MTR",
          "data": "0x"
        }
      ],
      "clauseCount": 60,
      "size": 1949,
      "gasUsed": 965000,
      "gasPayer": "0x0000000000000000000000000000000000000000",
      "paid": "482500000000000000",
      "reward": "482500000000000000",
      "reverted": false,
      "outputs": [
        {
          "events": [],
          "transfers": [
            {
              "sender": "0x0000000000000000000000000000000000000000",
              "recipient": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
              "amount": "0xeb7ca8d68d7740"
            }
          ],
          "contractAddress": null
        },
        {
          "events": [],
          "transfers": [
            {
              "sender": "0x0000000000000000000000000000000000000000",
              "recipient": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
              "amount": "0x84a6d778243a62"
            }
          ],
          "contractAddress": null
        }
      ],
      "createdAt": 1605706563,
      "updatedAt": "1970-01-19T14:01:46.563Z"
    }
  ]
}
```

### GET /api/blocks/recent

```json
{
  "blocks": [
    {
      "number": 2750,
      "hash": "0x00000abe29b51019fa3c03c69b9bda59fa0110f7694a8374f399a4a13e56485d",
      "parentID": "0x00000abdb42de5826f0ee72b2f945b1a1d9936e2d4844f7970487f72dd825a8b",
      "timestamp": 1609932609,
      "txHashs": [],
      "lastKBlockHeight": 4,
      "epoch": 2,
      "qcHeight": 2749,
      "blockType": 0,
      "gasUsed": 0,
      "txCount": 0,
      "signer": "0x7c30d59ac6d36afde7769bf69f3a58a8a7d74fd0"
    },
    {
      "number": 2749,
      "hash": "0x00000abdb42de5826f0ee72b2f945b1a1d9936e2d4844f7970487f72dd825a8b",
      "parentID": "0x00000abceb8d420c7f3515559a4630e86be6bec86b2cf8270dc627ef21fc4192",
      "timestamp": 1609932606,
      "txHashs": [],
      "lastKBlockHeight": 4,
      "epoch": 2,
      "qcHeight": 2748,
      "blockType": 0,
      "gasUsed": 0,
      "txCount": 0,
      "signer": "0x27b28d0fba098fe63539f26c8ebf893fb90967d1"
    },
    {
      "number": 2748,
      "hash": "0x00000abceb8d420c7f3515559a4630e86be6bec86b2cf8270dc627ef21fc4192",
      "parentID": "0x00000abb9e3de4de22efa3947d010ab65cf344a0f70cf921fff7f7e1a38eedeb",
      "timestamp": 1609932604,
      "txHashs": [],
      "lastKBlockHeight": 4,
      "epoch": 2,
      "qcHeight": 2747,
      "blockType": 0,
      "gasUsed": 0,
      "txCount": 0,
      "signer": "0xf137fee3e87a92054ca558ae26e827f184901d44"
    }
  ]
}
```

### GET /api/txs/:txid

```json
{
  "summary": {
    "hash": "0x6cafec49fcf66bf351b7c685391bafe4d5e829ae13745fb8b9a1903129bcf37d",
    "block": {
      "number": 4,
      "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
      "timestamp": 1609926175
    },
    "origin": "0x0000000000000000000000000000000000000000",
    "clauseCount": 127,
    "type": "reward",
    "paid": "1018500000000000000",
    "totalAmountStr": "0.000000803039579719 MTR",
    "feeStr": "1.0185 MTR",
    "reverted": false,
    "tos": [
      "0x0a05c2d862ca051010698b69b54278cbaf945ccb"
    ]
  },
  "tx": {
    "hash": "0x6cafec49fcf66bf351b7c685391bafe4d5e829ae13745fb8b9a1903129bcf37d",
    "block": {
      "number": 4,
      "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
      "timestamp": 1609926175
    },
    "txIndex": 1,
    "chainTag": 101,
    "blockRef": "0x0000000100000000",
    "expiration": 720,
    "gasPriceCoef": 0,
    "gas": 4200000,
    "nonce": "0xbc614e",
    "dependsOn": null,
    "origin": "0x0000000000000000000000000000000000000000",
    "clauses": [
      {
        "to": "0x0a05c2d862ca051010698b69b54278cbaf945ccb",
        "value": "6323146297",
        "token": "MTR",
        "data": "0x"
      },
      ...,
      {
        "to": "0x0a05c2d862ca051010698b69b54278cbaf945ccb",
        "value": "6323146297",
        "token": "MTR",
        "data": "0x"
      }
    ],
    "clauseCount": 127,
    "size": 3838,
    "gasUsed": 2037000,
    "gasPayer": "0x0000000000000000000000000000000000000000",
    "paid": "1018500000000000000",
    "reward": "1018500000000000000",
    "reverted": false,
    "createdAt": 1610431871
  }
}
```

### GET /api/txs/recent

```json
{
  "txs": [
    {
      "hash": "0x6cafec49fcf66bf351b7c685391bafe4d5e829ae13745fb8b9a1903129bcf37d",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 127,
      "type": "reward",
      "paid": "1018500000000000000",
      "totalAmountStr": "0.000000803039579719 MTR",
      "feeStr": "1.0185 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0xa98794607f7d6dfa76c7480b00e21fde431c7e8ed52bf77306ab0bea01a1059a",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 200,
      "type": "reward",
      "paid": "1602500000000000000",
      "totalAmountStr": "0.0000012646292594 MTR",
      "feeStr": "1.6025 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0x512fac9c04971c3fa1fff473eadb8a807e837d344bc21a8c259176a71ce0ca2f",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 1,
      "type": "call",
      "paid": "19498000000000000",
      "totalAmountStr": "0 MTRG",
      "feeStr": "0.019498 MTR",
      "reverted": false,
      "tos": ["0x6163636f756e742d6c6f636b2d61646472657373"]
    }
  ]
}
```

### GET /api/transfers/recent

```json
{
  "txs": [
    {
      "hash": "0x6cafec49fcf66bf351b7c685391bafe4d5e829ae13745fb8b9a1903129bcf37d",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 127,
      "type": "reward",
      "paid": "1018500000000000000",
      "totalAmountStr": "0.000000803039579719 MTR",
      "feeStr": "1.0185 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0xa98794607f7d6dfa76c7480b00e21fde431c7e8ed52bf77306ab0bea01a1059a",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 200,
      "type": "reward",
      "paid": "1602500000000000000",
      "totalAmountStr": "0.0000012646292594 MTR",
      "feeStr": "1.6025 MTR",
      "reverted": false,
      "tos": ["0x0a05c2d862ca051010698b69b54278cbaf945ccb"]
    },
    {
      "hash": "0x512fac9c04971c3fa1fff473eadb8a807e837d344bc21a8c259176a71ce0ca2f",
      "block": {
        "number": 4,
        "hash": "0x0000000404b005404db91b800c070da27b32fdfd6a7ba282398321cf3648ed8a",
        "timestamp": 1609926175
      },
      "origin": "0x0000000000000000000000000000000000000000",
      "clauseCount": 1,
      "type": "call",
      "paid": "19498000000000000",
      "totalAmountStr": "0 MTRG",
      "feeStr": "0.019498 MTR",
      "reverted": false,
      "tos": ["0x6163636f756e742d6c6f636b2d61646472657373"]
    }
  ]
}
```

### GET /api/pow/blocks/recent

```json
{
  "powBlocks": [
    {
      "tx": [
        "def2f10e4970c48cf64b1510b891418513a5dc736c3bf0adfde1019d52415a2a"
      ],
      "hash": "000000009a66fdd432894df0387e0fda8aa93dbb847524019de27cbd5a1e4609",
      "confirmations": 1,
      "size": 307,
      "weight": 1228,
      "height": 212629,
      "version": 536870912,
      "versionHex": "20000000",
      "time": 1608363105,
      "nonce": "3877701729",
      "bits": "1d00b021",
      "difficulty": "1",
      "nTx": 1,
      "medianTime": "1608362912",
      "strippedSize": 307,
      "previousBlockHash": "000000001b123b5a29da534c66a1164e533c697d904ea2b638d1f950afd3f2a5",
      "chainWork": "000000000000000000000000000000000000000000000ec63eb9620a1257365e",
      "merkleRoot": "def2f10e4970c48cf64b1510b891418513a5dc736c3bf0adfde1019d52415a2a",
      "createdAt": 1608363148
    },
    {
      "tx": [
        "30de84b3b1bd1f131ea9a5566b138ba28af6f7d738b0e06884b2f7c295633158"
      ],
      "hash": "000000001b123b5a29da534c66a1164e533c697d904ea2b638d1f950afd3f2a5",
      "confirmations": 1,
      "size": 307,
      "weight": 1228,
      "height": 212628,
      "version": 536870912,
      "versionHex": "20000000",
      "time": 1608363103,
      "nonce": "2042269824",
      "bits": "1d00afb6",
      "difficulty": "1",
      "nTx": 1,
      "medianTime": "1608362889",
      "strippedSize": 307,
      "previousBlockHash": "000000007aeb173db4348a4e84f5dd74ef00c5bbd664c6484de147b0737b9b9e",
      "chainWork": "000000000000000000000000000000000000000000000ec63eb962089e3fe378",
      "merkleRoot": "30de84b3b1bd1f131ea9a5566b138ba28af6f7d738b0e06884b2f7c295633158",
      "createdAt": 1608363105
    }
  ]
}
```

### GET /api/pow/rewards

```json
{
  "rewards": [
    {
      "number": 5981739,
      "timestamp": 1608362914,
      "epoch": 3537,
      "totalAmount": "0.000000420332283327 MTR",
      "details": [
        {
          "address": "0x51c7df367d6f5ad2c8410490443215b35fc35b3e",
          "subTotal": "0.000000320332283327 MTR"
        },
        {
          "address": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
          "subTotal": "0.0000001 MTR"
        }
      ]
    },
    {
      "number": 5980013,
      "timestamp": 1608358989,
      "epoch": 3536,
      "totalAmount": "0.00000031509748014 MTR",
      "details": [
        {
          "address": "0x51c7df367d6f5ad2c8410490443215b35fc35b3e",
          "subTotal": "0.00000031509748014 MTR"
        }
      ]
    }
  ]
}
```

### GET /api/auctions/present

```json
{
  "present": {
    "id": "0x.....",
    "startHeight": 10000,
    "startEpoch": 100,
    "endHeight": 20000,
    "endEpoch": 200,
    "createTime": 1608300000,
    "released": "2000 MTRG",
    "reserved": "1000 MTRG",
    "reservedPrice": "100000000000000000",
    "received": "10000 MTR",
    "auctionTxs": [
      {
        "address": "0x....",
        "amount": "5000 MTR",
        "count": 1,
        "nonce": 12345,
        "timestamp": 1608358989
      },
      {
        "address": "0x....",
        "amount": "5000 MTR",
        "count": 1,
        "nonce": 12345,
        "timestamp": 1608358123
      }
    ]
  }
}
```

### GET /api/auctions/summaries

```json
{
  "summaries": [
    {
      "id": "0x.....",
      "startHeight": 10000,
      "startEpoch": 100,
      "endHeight": 20000,
      "endEpoch": 200,
      "createTime": 1608300000,
      "released": "2000 MTRG",
      "reserved": "1000 MTRG",
      "received": "10000 MTR",
      "reservedPrice": "100000000000000000",
      "actualPrice": "10000000000000000",
      "dist": [
        { "address": "0x....", "amount": "500 MTRG" },
        { "address": "0x....", "amount": "400 MTRG" },
        { "address": "0x....", "amount": "600 MTRG" },
        { "address": "0x....", "amount": "500 MTRG" }
      ]
    }
  ]
}
```

## Run Powergrid

### Clone Source

```shell
git clone https://github.com/meterio/scan-api.git
cd powergrid
```

### Dependency && Build

```shell
npm run build
```

### Configure Typeorm

Follow the official [instruction](https://typeorm.io/#/using-ormconfig), configure your local project.

### Start Server

```shell
npm start
```
