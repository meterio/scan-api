import BigNumber from 'bignumber.js';

import { Auction } from '../model/Auction.interface';
import AuctionModel from '../model/Auction.model';
import { formalizePageAndLimit } from '../utils/utils';

export class AuctionRepo {
  private model = AuctionModel;

  public async findAll() {
    return this.model.find({}).sort({ createTime: -1 });
  }

  public async findAllPagination(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({})
      .sort({ createTime: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByID(id: string) {
    return this.model.findOne({ id });
  }

  public async existID(id: string) {
    return this.model.exists({ id });
  }

  public async create(auction: Auction) {
    return this.model.create(auction);
  }
}

export default AuctionRepo;
