import { Tx } from '../model/tx.interface';
import txModel from '../model/tx.model';
import { formalizePageAndLimit } from '../utils/utils';

export class TxRepo {
  private tx = txModel;

  public async count() {
    return this.tx.estimatedDocumentCount();
  }

  public async findAll() {
    return this.tx.find();
  }

  public async findRecent(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.tx
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByHash(hash: string) {
    return this.tx.findOne({ hash });
  }
  public async countByAccount(addr: string) {
    return this.tx.count({
      $or: [
        { origin: { $regex: new RegExp(`^${addr}$`, 'i') } },
        {
          clauses: {
            $elemMatch: { to: { $regex: new RegExp(`^${addr}$`, 'i') } },
          },
        },
      ],
    });
  }

  public async findByAccount(
    addr: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.tx
      .find({
        $or: [
          { origin: { $regex: new RegExp(`^${addr}$`, 'i') } },
          {
            clauses: {
              $elemMatch: { to: { $regex: new RegExp(`^${addr}$`, 'i') } },
            },
          },
        ],
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
