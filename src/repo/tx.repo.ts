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
      .sort({ 'block.number': -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByHash(hash: string) {
    return this.tx.findOne({ hash });
  }

  public async countByAccount(addr: string) {
    return this.tx.countDocuments({
      $or: [
        { origin: addr.toLowerCase() },
        {
          clauses: {
            $elemMatch: { to: addr.toLowerCase() },
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
          { origin: { $regex: addr.toLowerCase() } },
          {
            clauses: {
              $elemMatch: { to: addr.toLowerCase() },
            },
          },
        ],
      })
      .sort({ 'block.number': -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findSectionByAccount(
    addr: string,
    startblock: number,
    endblock: number,
    sort: string
  ) {
    return this.tx
      .find({
        $and: [
          { origin: { $regex: addr.toLowerCase() } },
          {
            'block.number': {
              $gte: startblock,
              $lt: endblock,
            },
          },
        ],
      })
      .sort({ 'block.number': sort === 'asc' ? 1 : -1 });
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
