import BigNumber from 'bignumber.js';

import { BlockConcise } from '../model/blockConcise.interface';
import tokenBalanceModel from '../model/tokenBalance.model';
import { formalizePageAndLimit } from '../utils/utils';

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

  public async findByAddressWithPageLimit(
    address: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({ address: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findAllByTokenAddress(tokenAddress: string) {
    return this.model.find({ tokenAddress: tokenAddress.toLowerCase() });
  }

  public async findByTokenAddress(
    tokenAddress: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    console.log(page, limit);
    return this.model
      .find({ tokenAddress: tokenAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async countAllByTokenAddress(tokenAddress: string) {
    return this.model.countDocuments({
      tokenAddress: tokenAddress.toLowerCase(),
    });
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
      rank: 99999999,
    });
  }
}

export default TokenBalanceRepo;
