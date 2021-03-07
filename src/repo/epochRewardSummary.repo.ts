import { EpochRewardSummary } from '../model/epochRewardSummary.interface';
import EpochRewardSummaryModel from '../model/epochRewardSummary.model';
import { formalizePageAndLimit } from '../utils/utils';

export class EpochRewardSummaryRepo {
  private model = EpochRewardSummaryModel;

  public async findAll(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({})
      .sort({ epoch: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async countAll() {
    return this.model.estimatedDocumentCount();
  }

  public async findByEpoch(epoch: number) {
    return this.model.findOne({ epoch });
  }

  public async existEpoch(epoch: number) {
    return this.model.exists({ epoch });
  }

  public async create(epochRewardSummary: EpochRewardSummary) {
    return this.model.create(epochRewardSummary);
  }
}

export default EpochRewardSummaryRepo;
