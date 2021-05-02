import { Bid } from '../model/bid.interface';
import bidModel from '../model/bid.model';
import { formalizePageAndLimit } from '../utils/utils';
export class BidRepo {
  private model = bidModel;

  public async findAll() {
    return this.model.find();
  }

  public async countByAddress(address: string) {
    return this.model.countDocuments({
      address: address.toLowerCase(),
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
        address: address.toLowerCase(),
      })
      .sort({ timestamp: -1 })
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
    return this.model.countDocuments({ auctionID });
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

  public async countUserbidsByAuctionID(auctionID: string) {
    return this.model.countDocuments({ auctionID, type: 'userbid' });
  }

  public async findUserbidsByAuctionID(
    auctionID: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({ auctionID, type: 'userbid' })
      .limit(limit)
      .skip(limit * page);
  }

  public async findAutobidsByAuctionID(auctionID: string) {
    return this.model.find({ auctionID, type: 'autobid' });
  }

  public async findAutobidsByEpoch(
    epoch: number,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({ epoch, type: 'userbid' })
      .limit(limit)
      .skip(limit * page);
  }

  public async bulkInsert(...bids: Bid[]) {
    return this.model.create(bids);
  }
}

export default BidRepo;
