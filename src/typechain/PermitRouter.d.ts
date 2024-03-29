/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface PermitRouterInterface extends ethers.utils.Interface {
  functions: {
    "owner()": FunctionFragment;
    "pair()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)": FunctionFragment;
    "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)": FunctionFragment;
    "token0()": FunctionFragment;
    "token1()": FunctionFragment;
    "token2()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pair", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "swapExactTokensForTokens",
    values: [string, BigNumberish, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "swapTokensForExactTokens",
    values: [string, BigNumberish, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "token0", values?: undefined): string;
  encodeFunctionData(functionFragment: "token1", values?: undefined): string;
  encodeFunctionData(functionFragment: "token2", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pair", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapExactTokensForTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapTokensForExactTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token0", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token2", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class PermitRouter extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: PermitRouterInterface;

  functions: {
    owner(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "owner()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    pair(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "pair()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

    swapExactTokensForTokens(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    swapTokensForExactTokens(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    token0(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "token0()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    token1(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "token1()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    token2(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "token2()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  pair(overrides?: CallOverrides): Promise<string>;

  "pair()"(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

  "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

  swapExactTokensForTokens(
    owner: string,
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)"(
    owner: string,
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  swapTokensForExactTokens(
    owner: string,
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)"(
    owner: string,
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  token0(overrides?: CallOverrides): Promise<string>;

  "token0()"(overrides?: CallOverrides): Promise<string>;

  token1(overrides?: CallOverrides): Promise<string>;

  "token1()"(overrides?: CallOverrides): Promise<string>;

  token2(overrides?: CallOverrides): Promise<string>;

  "token2()"(overrides?: CallOverrides): Promise<string>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferOwnership(address)"(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    pair(overrides?: CallOverrides): Promise<string>;

    "pair()"(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "renounceOwnership()"(overrides?: CallOverrides): Promise<void>;

    swapExactTokensForTokens(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    swapTokensForExactTokens(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    token0(overrides?: CallOverrides): Promise<string>;

    "token0()"(overrides?: CallOverrides): Promise<string>;

    token1(overrides?: CallOverrides): Promise<string>;

    "token1()"(overrides?: CallOverrides): Promise<string>;

    token2(overrides?: CallOverrides): Promise<string>;

    "token2()"(overrides?: CallOverrides): Promise<string>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    OwnershipTransferred(
      previousOwner: string | null,
      newOwner: string | null
    ): EventFilter;
  };

  estimateGas: {
    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    pair(overrides?: CallOverrides): Promise<BigNumber>;

    "pair()"(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides): Promise<BigNumber>;

    "renounceOwnership()"(overrides?: Overrides): Promise<BigNumber>;

    swapExactTokensForTokens(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    swapTokensForExactTokens(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    token0(overrides?: CallOverrides): Promise<BigNumber>;

    "token0()"(overrides?: CallOverrides): Promise<BigNumber>;

    token1(overrides?: CallOverrides): Promise<BigNumber>;

    "token1()"(overrides?: CallOverrides): Promise<BigNumber>;

    token2(overrides?: CallOverrides): Promise<BigNumber>;

    "token2()"(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pair(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pair()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides): Promise<PopulatedTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    swapExactTokensForTokens(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "swapExactTokensForTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    swapTokensForExactTokens(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "swapTokensForExactTokens(address,uint256,uint256,uint256,bytes)"(
      owner: string,
      amountOut: BigNumberish,
      amountInMax: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    token0(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token0()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token1(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token1()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token2(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token2()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
