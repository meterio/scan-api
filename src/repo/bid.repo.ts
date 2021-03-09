import { Bid } from '../model/bid.interface';
import bidModel from '../model/bid.model';
import { formalizePageAndLimit } from '../utils/utils';
export class BidRepo {
  private model = bidModel;

  public async findAll() {
    return this.model.find();
  }

  public async countByAddress(address: string) {
    return this.model.count({
      address: { $regex: new RegExp(`^${address}$`, 'i') },
    });
  }

  public async findByAddress(
    address: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({
        address: { $regex: new RegExp(`^${address}$`, 'i') },
      })
      .limit(limit)
      .skip(limit * page);
  }

  public async create(bid: Bid) {
    return this.model.create(bid);
  }

  public async findById(id: string) {
    return this.model.findOne({ id });
  }

  public async countByAuctionID(auctionID: string) {
    return this.model.count({ auctionID });
  }

  public async findByAuctionID(
    auctionID: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({ auctionID })
      .limit(limit)
      .skip(limit * page);
  }

  public async bulkInsert(...bids: Bid[]) {
    return this.model.create(bids);
  }
}

export default BidRepo;
