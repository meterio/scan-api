import { BlockType } from '../const';
import { Block } from '../model/block.interface';
import blockModel from '../model/block.model';
import { formalizePageAndLimit } from '../utils/utils';

export class BlockRepo {
  private block = blockModel;
  public async getBestBlock() {
    return this.block.findOne({}).sort({ number: -1 });
  }

  public async findAll() {
    return this.block.find();
  }

  public async count() {
    return this.block.estimatedDocumentCount();
  }

  public async findRecent(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.block
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async countBySigner(address: string) {
    return this.block.count({ signer: address });
  }

  public async findByBeneficiary(
    address: string,
    pageNum?: number,
    limitNum?: number
  ) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.block
      .find({ beneficiary: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async countKBlocks() {
    return this.block.count({ blockType: BlockType.KBlock });
  }

  public async findKBlocks(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.block
      .find({ blockType: BlockType.KBlock })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findKBlocksByEpochs(epochs: number[]) {
    return this.block.find({
      blockType: BlockType.KBlock,
      epoch: { $in: epochs },
    });
  }

  public async findByNumber(num: number) {
    return this.block.findOne({
      number: num,
    });
  }

  public async findFutureBlocks(num: number) {
    return this.block.find({ number: { $gt: num } });
  }

  public async findByHash(hash: string) {
    return this.block.findOne({
      hash,
    });
  }

  public async create(block: Block) {
    return this.block.create(block);
  }

  public async bulkInsert(...block: Block[]) {
    return this.block.create(block);
  }

  public async delete(hash: string) {
    return this.block.deleteOne({ hash });
  }
}

export default BlockRepo;
