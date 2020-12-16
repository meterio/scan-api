# Scan API

API service of Meter next generation Scan.

## API

- `GET /api/metric/all` - Get all metrics for meter network
- `GET /api/search/:hash` - Search for tx/block/account
- `GET /api/accounts/:addr` - Get account summary
- `GET /api/account/:addr/txs?page=1&limit=10` - Get transactions of account <sup>i</sup>
- `GET /api/account/:addr/transfers?page=1&limit=10` - Get Token transfers of account <sup>i</sup>
- `GET /api/blocks/:revision` - Get block, revision can be `best`, `block number` or `block ID`
- `GET /api/blocks/:blockid/txs` - Get block transactions
- `GET /api/blocks/recent` - Get recent blocks
- `GET /api/txs/:txid` - Get transaction
- `GET /api/txs/recent` - Get recent transactions
- `GET /api/transfers/recent` - Get recent transfers
- `GET /api/validators/all` - Get validators information

<b>i</b> : List API have the functionality of pagination, just specify `limit` and `offset` as the URL parameter.

## Sample Returns:

### GET /api/metrics/all

```javascript
{
  "mtrg": {
    "price": "0.345471",
    "priceChange": "2.92%",
    "avgDailyReward": "235 MTRG"
  },
  "mtr": {
    "price": "0.405225",
    "priceChange": "-0.12%"
  },
  "pos": {
    "best": 2859866,
    "kblock": 823695
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
    "best": 208309,
    "difficulty": "1.567148118035296",
    "hashrate": "104380250.4994091"
  }
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
      "txHashs": [],
      "number": 1570,
      "size": 441,
      "parentID": "0x0000062167a7ff8aa1bb162b18fae386698862ce357cd29ef55ab52dd0a81cde",
      "timestamp": 1593911928,
      "gasLimit": 200000000,
      "beneficiary": "0x3256443cf7c7c6c9bf9c874f5f239225e0b3487e",
      "gasUsed": 0,
      "totalScore": 1570,
      "txsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      "stateRoot": "0x6bb47f2646d26a09b2966558ce4ce80d1f80ca429fec57b0515c9ba73630e796",
      "receiptsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      "signer": "0xdc704f70d03f5665da5c712d3a815f8b53ae9caa",
      "hash": "0x00000622fff7d2b520f5764f664fc43151ba5990d0ebf8a399bf0fb0b52f32ed",
      "reward": "0",
      "gasChanged": 0,
      "score": 1,
      "txCount": 0,
      "blockType": "MBlock",
      "createdAt": 1605791137
    },
    ...,
    {
      "txHashs": [],
      "number": 1561,
      "size": 440,
      "parentID": "0x000006187f87f5e5fdab0f07c03c895888757d93f73c29226fc72fa28b4409b9",
      "timestamp": 1593911908,
      "gasLimit": 200000000,
      "beneficiary": "0xe66893147a730ddaf9e0ae42ad7ec8456d1fc50d",
      "gasUsed": 0,
      "totalScore": 1561,
      "txsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      "stateRoot": "0x6bb47f2646d26a09b2966558ce4ce80d1f80ca429fec57b0515c9ba73630e796",
      "receiptsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      "signer": "0x74258669ea5c8420c299a713f9d6cd931d1904fb",
      "hash": "0x00000619402f1057069404ccf644072506faacef95dc1a41b4cabb935ac664df",
      "reward": "0",
      "gasChanged": 0,
      "score": 1,
      "txCount": 0,
      "blockType": "MBlock",
      "createdAt": 1605776508
    }
  ]
}
```

### GET /api/txs/:txid

```json
{
  "tx": {
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
      ...,
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
        "events": [

        ],
        "transfers": [
          {
            "sender": "0x0000000000000000000000000000000000000000",
            "recipient": "0xfa9c7149416e8cca36994193b0a341e4e72acb88",
            "amount": "0xeb7ca8d68d7740"
          }
        ],
        "contractAddress": null
      },
      ...,
      {
        "events": [

        ],
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
}
```

### GET /api/txs/recent

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

### GET /api/transfers/recent

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

### GET /api/validators/all

```json
{
  "totalStaked": "400 MTRG",
  "totalDelegateStaked": "0 MTRG",
  "onlineNode": 0,
  "totalNode": 0,
  "delegates": [],
  "candidates": [
    {
      "name": "Simon",
      "address": "0xbf85ef4216340eb5cd3c57b550aae7a2712d48d2",
      "netAddr": "18.138.202.36:8670",
      "pubKey": "BIRP8aFk...ZKX65AE=",
      "commission%": "10%",
      "totalVotes": "400 MTRG"
    }
  ],
  "jailed": []
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
