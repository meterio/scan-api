import BigNumber from 'bignumber.js';

import { BlockConcise } from '../model/blockConcise.interface';
import tokenBalanceModel from '../model/tokenBalance.model';

export class TokenBalanceRepo {
  private model = tokenBalanceModel;

  public async findAll() {
    return this.model.find();
  }

  public async findByAddress(address: string, tokenAddress: string) {
    return this.model.findOne({
      address: address.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
    });
  }

  public async findAllByAddress(address: string) {
    return this.model.find({ address: address.toLowerCase() });
  }

  public async exist(address: string, tokenAddress: string) {
    return this.model.exists({
      address: address.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
    });
  }

  public async create(
    address: string,
    tokenAddress: string,
    lastUpdate: BlockConcise
  ) {
    return this.model.create({
      address,
      balance: new BigNumber(0),
      tokenAddress,
      lastUpdate,
    });
  }
}

export default TokenBalanceRepo;
