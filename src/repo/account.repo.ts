import BigNumber from 'bignumber.js';

import accountModel from '../model/account.model';
import { BlockConcise } from '../model/blockConcise.interface';
import { formalizePageAndLimit } from '../utils/utils';

export class AccountRepo {
  private model = accountModel;

  public async findAll() {
    return this.model.find();
  }

  public async findByAddress(address: string) {
    return this.model.findOne({
      address: address.toLowerCase(),
    });
  }

  public async count() {
    return this.model.estimatedDocumentCount();
  }

  public async countNonZero() {
    return this.model.countDocuments({
      $or: [
        { mtrBalance: { $ne: new BigNumber('0') } },
        { mtrgBalance: { $ne: new BigNumber('0') } },
      ],
    });
  }

  public async findKnownAccounts() {
    return this.model.find({ name: { $exists: true } });
  }

  public async findTopMTRAccounts(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find()
      .sort({ mtrRank: 1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findTopMTRGAccounts(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find()
      .sort({ mtrgRank: 1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByAddressList(addressList: string[]) {
    return this.model.find({
      address: { $in: addressList },
    });
  }

  public async create(
    address: string,
    firstSeen: BlockConcise,
    lastUpdate: BlockConcise
  ) {
    return this.model.create({
      address,
      mtrBalance: new BigNumber('0'),
      mtrgBalance: new BigNumber('0'),
      mtrRank: 99999999,
      mtrgRank: 99999999,

      firstSeen,
      lastUpdate,
    });
  }
}

export default AccountRepo;
