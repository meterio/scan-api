/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MeterGovERC20Upgradeable } from "../MeterGovERC20Upgradeable";

export class MeterGovERC20Upgradeable__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<MeterGovERC20Upgradeable> {
    return super.deploy(overrides || {}) as Promise<MeterGovERC20Upgradeable>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MeterGovERC20Upgradeable {
    return super.attach(address) as MeterGovERC20Upgradeable;
  }
  connect(signer: Signer): MeterGovERC20Upgradeable__factory {
    return super.connect(signer) as MeterGovERC20Upgradeable__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MeterGovERC20Upgradeable {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MeterGovERC20Upgradeable;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getBlackList",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "permit",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "setBlackList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBurned",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611c1a806100206000396000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c806372700241116100de5780639fd5a6cf11610097578063ca15c87311610071578063ca15c87314610378578063d547741f1461038b578063d89135cd1461039e578063dd62ed3e146103a657600080fd5b80639fd5a6cf1461034a578063a217fddf1461035d578063a9059cbb1461036557600080fd5b806372700241146102b05780637ecebe00146102c35780638129fc1c146102e45780639010d07c146102ec57806391d148541461031757806395d89b411461032a57600080fd5b80632f2ff15d116101305780632f2ff15d1461022c57806330adf81f14610241578063313ce5671461026857806336568abe146102775780633fbdc67d1461028a57806370a082311461029d57600080fd5b806301ffc9a71461017857806306fdde03146101a0578063095ea7b3146101cd57806318160ddd146101e057806323b872dd146101f6578063248a9ca314610209575b600080fd5b61018b61018636600461196a565b6103df565b60405190151581526020015b60405180910390f35b60408051808201909152600881526726b2ba32b923b7bb60c11b60208201525b6040516101979190611a22565b61018b6101db3660046118c0565b61040a565b6101e8610476565b604051908152602001610197565b61018b61020436600461179e565b6104f7565b6101e861021736600461190c565b60009081526099602052604090206001015490565b61023f61023a366004611925565b6105bd565b005b6101e87f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b60405160128152602001610197565b61023f610285366004611925565b6105e4565b61018b610298366004611750565b610606565b6101e86102ab366004611750565b610652565b61023f6102be366004611750565b6106d0565b6101e86102d1366004611750565b6101006020526000908152604090205481565b61023f610723565b6102ff6102fa366004611948565b610801565b6040516001600160a01b039091168152602001610197565b61018b610325366004611925565b610820565b6040805180820190915260048152634d54524760e01b60208201526101c0565b61018b6103583660046117da565b61084b565b6101e8600081565b61018b6103733660046118c0565b610a11565b6101e861038636600461190c565b610a27565b61023f610399366004611925565b610a3e565b6101e8610a48565b6101e86103b436600461176b565b6001600160a01b03918216600090815260fd6020908152604080832093909416825291909152205490565b60006001600160e01b03198216635a05180f60e01b1480610404575061040482610a8d565b92915050565b33600081815260fd602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906104659086815260200190565b60405180910390a350600192915050565b60fe5460408051620511b760ed1b815290516000926001600160a01b03169163a236e000916004808301926020929190829003018186803b1580156104ba57600080fd5b505afa1580156104ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104f29190611994565b905090565b6001600160a01b038316600090815260fd6020908152604080832033845290915281205482111561056f5760405162461bcd60e51b815260206004820152601f60248201527f6275696c74696e3a20696e73756666696369656e7420616c6c6f77616e63650060448201526064015b60405180910390fd5b6001600160a01b038416600090815260fd60209081526040808320338452909152812080548492906105a2908490611afd565b909155506105b39050848484610ac2565b5060019392505050565b6105c78282610c8d565b600082815260cb602052604090206105df9082610cb3565b505050565b6105ee8282610cc8565b600082815260cb602052604090206105df9082610d46565b60006106128133610820565b61062e5760405162461bcd60e51b815260040161056690611a55565b506001600160a01b038116600090815260ff6020819052604090912054165b919050565b60fe54604051630a30af2760e41b81526001600160a01b038381166004830152600092169063a30af2709060240160206040518083038186803b15801561069857600080fd5b505afa1580156106ac573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104049190611994565b6106db600033610820565b6106f75760405162461bcd60e51b815260040161056690611a55565b6001600160a01b0316600090815260ff60208190526040909120805460ff198116921615919091179055565b600054610100900460ff168061073c575060005460ff16155b6107585760405162461bcd60e51b815260040161056690611a78565b600054610100900460ff1615801561077a576000805461ffff19166101011790555b6107c46107a260408051808201909152600881526726b2ba32b923b7bb60c11b602082015290565b60405180604001604052806004815260200163076312e360e41b815250610d5b565b6107cf600033610dd2565b60fe80546001600160a01b0319166a4d657465724e617469766517905580156107fe576000805461ff00191690555b50565b600082815260cb602052604081206108199083610ddc565b9392505050565b60009182526099602090815260408084206001600160a01b0393909316845291905290205460ff1690565b6000428310156108885760405162461bcd60e51b8152602060048201526008602482015267657870697265642160c01b6044820152606401610566565b6001600160a01b03861660009081526101006020526040812080547f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c99189918991899190866108d683611b5b565b909155506040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810185905260e001604051602081830303815290604052805190602001209050600061093582610de8565b905060006109438286610e36565b9050806001600160a01b0316896001600160a01b0316146109a65760405162461bcd60e51b815260206004820152601960248201527f5065726d69743a20696e76616c6964207369676e6174757265000000000000006044820152606401610566565b6001600160a01b03898116600081815260fd60209081526040808320948d16808452948252918290208b905590518a81527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a350600198975050505050505050565b6000610a1e338484610ac2565b50600192915050565b600081815260cb6020526040812061040490610e5a565b6105ee8282610e64565b60fe546040805163eaa93f6b60e01b815290516000926001600160a01b03169163eaa93f6b916004808301926020929190829003018186803b1580156104ba57600080fd5b60006001600160e01b03198216637965db0b60e01b148061040457506301ffc9a760e01b6001600160e01b0319831614610404565b6001600160a01b038316600090815260ff60208190526040909120541615610afc5760405162461bcd60e51b815260040161056690611a55565b8015610c3b5760fe546040516315df233f60e11b81526001600160a01b0385811660048301526024820184905290911690632bbe467e90604401602060405180830381600087803b158015610b5057600080fd5b505af1158015610b64573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b8891906118ea565b610bd45760405162461bcd60e51b815260206004820152601d60248201527f6275696c74696e3a20696e73756666696369656e742062616c616e63650000006044820152606401610566565b60fe546040516337dde9b560e21b81526001600160a01b038481166004830152602482018490529091169063df77a6d490604401600060405180830381600087803b158015610c2257600080fd5b505af1158015610c36573d6000803e3d6000fd5b505050505b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610c8091815260200190565b60405180910390a3505050565b600082815260996020526040902060010154610ca98133610e8a565b6105df8383610eee565b6000610819836001600160a01b038416610f74565b6001600160a01b0381163314610d385760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b6064820152608401610566565b610d428282610fc3565b5050565b6000610819836001600160a01b03841661102a565b600054610100900460ff1680610d74575060005460ff16155b610d905760405162461bcd60e51b815260040161056690611a78565b600054610100900460ff16158015610db2576000805461ffff19166101011790555b610dbc838361111d565b80156105df576000805461ff0019169055505050565b6105c782826111a7565b600061081983836111b1565b6000610404610df56111db565b8360405161190160f01b6020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b6000806000610e458585611256565b91509150610e52816112c6565b509392505050565b6000610404825490565b600082815260996020526040902060010154610e808133610e8a565b6105df8383610fc3565b610e948282610820565b610d4257610eac816001600160a01b03166014611481565b610eb7836020611481565b604051602001610ec89291906119ad565b60408051601f198184030181529082905262461bcd60e51b825261056691600401611a22565b610ef88282610820565b610d425760008281526099602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610f303390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6000818152600183016020526040812054610fbb57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610404565b506000610404565b610fcd8282610820565b15610d425760008281526099602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6000818152600183016020526040812054801561111357600061104e600183611afd565b855490915060009061106290600190611afd565b90508181146110c757600086600001828154811061108257611082611bb8565b90600052602060002001549050808760000184815481106110a5576110a5611bb8565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806110d8576110d8611ba2565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610404565b6000915050610404565b600054610100900460ff1680611136575060005460ff16155b6111525760405162461bcd60e51b815260040161056690611a78565b600054610100900460ff16158015611174576000805461ffff19166101011790555b825160208085019190912083519184019190912060019190915560025580156105df576000805461ff0019169055505050565b610d428282610eee565b60008260000182815481106111c8576111c8611bb8565b9060005260206000200154905092915050565b60006104f27f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f61120a60015490565b6002546040805160208101859052908101839052606081018290524660808201523060a082015260009060c0016040516020818303038152906040528051906020012090509392505050565b60008082516041141561128d5760208301516040840151606085015160001a6112818782858561161d565b945094505050506112bf565b8251604014156112b757602083015160408401516112ac86838361170a565b9350935050506112bf565b506000905060025b9250929050565b60008160048111156112da576112da611b8c565b14156112e35750565b60018160048111156112f7576112f7611b8c565b14156113455760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610566565b600281600481111561135957611359611b8c565b14156113a75760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610566565b60038160048111156113bb576113bb611b8c565b14156114145760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610566565b600481600481111561142857611428611b8c565b14156107fe5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610566565b60606000611490836002611ade565b61149b906002611ac6565b67ffffffffffffffff8111156114b3576114b3611bce565b6040519080825280601f01601f1916602001820160405280156114dd576020820181803683370190505b509050600360fc1b816000815181106114f8576114f8611bb8565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061152757611527611bb8565b60200101906001600160f81b031916908160001a905350600061154b846002611ade565b611556906001611ac6565b90505b60018111156115ce576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811061158a5761158a611bb8565b1a60f81b8282815181106115a0576115a0611bb8565b60200101906001600160f81b031916908160001a90535060049490941c936115c781611b44565b9050611559565b5083156108195760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610566565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08311156116545750600090506003611701565b8460ff16601b1415801561166c57508460ff16601c14155b1561167d5750600090506004611701565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa1580156116d1573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166116fa57600060019250925050611701565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b0161172b8782888561161d565b935093505050935093915050565b80356001600160a01b038116811461064d57600080fd5b60006020828403121561176257600080fd5b61081982611739565b6000806040838503121561177e57600080fd5b61178783611739565b915061179560208401611739565b90509250929050565b6000806000606084860312156117b357600080fd5b6117bc84611739565b92506117ca60208501611739565b9150604084013590509250925092565b600080600080600060a086880312156117f257600080fd5b6117fb86611739565b945061180960208701611739565b93506040860135925060608601359150608086013567ffffffffffffffff8082111561183457600080fd5b818801915088601f83011261184857600080fd5b81358181111561185a5761185a611bce565b604051601f8201601f19908116603f0116810190838211818310171561188257611882611bce565b816040528281528b602084870101111561189b57600080fd5b8260208601602083013760006020848301015280955050505050509295509295909350565b600080604083850312156118d357600080fd5b6118dc83611739565b946020939093013593505050565b6000602082840312156118fc57600080fd5b8151801515811461081957600080fd5b60006020828403121561191e57600080fd5b5035919050565b6000806040838503121561193857600080fd5b8235915061179560208401611739565b6000806040838503121561195b57600080fd5b50508035926020909101359150565b60006020828403121561197c57600080fd5b81356001600160e01b03198116811461081957600080fd5b6000602082840312156119a657600080fd5b5051919050565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516119e5816017850160208801611b14565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351611a16816028840160208801611b14565b01602801949350505050565b6020815260008251806020840152611a41816040850160208701611b14565b601f01601f19169190910160400192915050565b6020808252600990820152683337b93134b23232b760b91b604082015260600190565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b60008219821115611ad957611ad9611b76565b500190565b6000816000190483118215151615611af857611af8611b76565b500290565b600082821015611b0f57611b0f611b76565b500390565b60005b83811015611b2f578181015183820152602001611b17565b83811115611b3e576000848401525b50505050565b600081611b5357611b53611b76565b506000190190565b6000600019821415611b6f57611b6f611b76565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052603160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fdfea2646970667358221220362356b4cb1ad2567b450c4b3fbf6f45e11025b578d52c29eddf2b7beb1521a064736f6c63430008070033";
