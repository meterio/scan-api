import { Tx } from '../model/tx.interface';
import txModel from '../model/tx.model';
import { formalizePageAndLimit } from '../utils/utils';

export class TxRepo {
  private tx = txModel;

  public async count() {
    return this.tx.countDocuments();
  }

  public async findAll() {
    return this.tx.find();
  }

  public async findRecent(count: number) {
    return this.tx.find().sort({ createdAt: -1 }).limit(count);
  }

  public async findByHash(hash: string) {
    return this.tx.findOne({ hash });
  }

  public async findByAccount(
    addr: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.tx
      .find({
        $or: [{ origin: addr }, { clauses: { $elemMatch: { to: addr } } }],
      })
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
