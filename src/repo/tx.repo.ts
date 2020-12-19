import { LIMIT_WINDOW, RECENT_WINDOW } from '../const';
import { Tx } from '../model/tx.interface';
import txModel from '../model/tx.model';

export class TxRepo {
  private tx = txModel;

  public async findAll() {
    return this.tx.find();
  }

  public async findRecent() {
    return this.tx.find().sort({ createdAt: -1 }).limit(RECENT_WINDOW);
  }

  public async findByHash(hash: string) {
    return this.tx.findOne({ hash });
  }

  public async findByAccount(addr: string, page?: number, limit?: number) {
    // convert page (1..n) to (0..n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.tx
      .find({ origin: addr })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByHashs(hashs: string[]) {
    return this.tx.find({ hash: { $in: hashs } });
  }

  public async exist(hash: string) {
    return this.tx.exists({ hash });
  }

  public async create(tx: Tx) {
    return this.tx.create(tx);
  }

  public async bulkInsert(...txs: Tx[]) {
    await this.tx.create(txs);
  }

  public async delete(hash: string) {
    return this.tx.deleteOne({ hash });
  }
}

export default TxRepo;
