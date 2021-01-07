import { LIMIT_WINDOW, Token } from '../const';
import { RECENT_WINDOW } from '../const';
import { Transfer } from '../model/transfer.interface';
import transferModel from '../model/transfer.model';
import { formalizePageAndLimit } from '../utils/utils';

export class TransferRepo {
  private transfer = transferModel;

  public async findAll() {
    return this.transfer.find();
  }

  public async findRecent(count: number) {
    return this.transfer.find().sort({ createdAt: -1 }).limit(count);
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

  public async findByAccount(
    addr: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.transfer
      .find({ $or: [{ from: addr }, { to: addr }] })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findERC20TransferByAccount(
    addr: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.transfer
      .find({
        $and: [{ token: Token.ERC20 }, { $or: [{ from: addr }, { to: addr }] }],
      })
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
