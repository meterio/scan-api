import { LIMIT_WINDOW, Token } from '../const';
import { RECENT_WINDOW } from '../const';
import { Transfer } from '../model/transfer.interface';
import transferModel from '../model/transfer.model';

export class TransferRepo {
  private transfer = transferModel;

  public async findAll() {
    return this.transfer.find();
  }

  public async findRecent() {
    return this.transfer.find().sort({ createdAt: -1 }).limit(RECENT_WINDOW);
  }

  public async findByHash(hash: string) {
    return this.transfer.findOne({ hash });
  }

  public async findByRange(token: Token, startTS: number, endTS: number) {
    return this.transfer
      .find({
        token,
        blockTimestamp: { $gte: startTS, $lt: endTS },
      })
      .sort({ blockNumber: 1 });
  }

  public async findByAccount(addr: string, page?: number, limit?: number) {
    // convert page (1 .. n) to (0 .. n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.transfer
      .find({ $or: [{ from: addr }, { to: addr }] })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async exist(txHash: string, clauseIndex: number) {
    return this.transfer.exists({ txHash, clauseIndex });
  }

  public async create(transfer: Transfer) {
    return this.transfer.create(transfer);
  }

  public async deleteFutureTransfers(num: number) {
    return this.transfer.find({ 'block.number': { $gt: num } });
  }

  public async bulkInsert(...transfers: Transfer[]) {
    return this.transfer.create(transfers);
  }
}

export default TransferRepo;
