import { ValidatorReward } from '../model/validatorReward.interface';
import ValidatorRewardModel from '../model/validatorReward.model';
import { formalizePageAndLimit } from '../utils/utils';

export class ValidatorRewardRepo {
  private model = ValidatorRewardModel;

  public async countAll() {
    return this.model.estimatedDocumentCount({});
  }

  public async findAll(pageNum?: number, limitNum?: number) {
    const { page, limit } = formalizePageAndLimit(pageNum, limitNum);
    return this.model
      .find({})
      .sort({ epoch: -1 })
      .limit(limit)
      .skip(limit * page);
  }

  public async findByEpoch(epoch: number) {
    return this.model.findOne({ epoch });
  }

  public async existEpoch(epoch: number) {
    return this.model.exists({ epoch });
  }

  public async create(validatorReward: ValidatorReward) {
    return this.model.create(validatorReward);
  }
}

export default ValidatorRewardRepo;
