import BigNumber from 'bignumber.js';

import { ValidatorStatus } from '../const';
import { LIMIT_WINDOW } from '../const';
import { Validator } from '../model/validator.interface';
import validatorModel from '../model/validator.model';

export class ValidatorRepo {
  private model = validatorModel;

  public async findAll(page?: number, limit?: number) {
    // convert page (1 .. n) to (0 .. n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.model
      .find({})
      .limit(limit)
      .skip(limit * page);
  }

  public async findCandidates(page?: number, limit?: number) {
    // convert page (1 .. n) to (0 .. n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.model
      .find({
        status: { $in: [ValidatorStatus.CANDIDATE, ValidatorStatus.DELEGATE] },
      })
      .limit(limit)
      .skip(limit * page);
  }

  public async countCandidate() {
    return this.model.count({
      status: { $in: [ValidatorStatus.CANDIDATE, ValidatorStatus.DELEGATE] },
    });
  }

  public async findDelegate(page?: number, limit?: number) {
    // convert page (1 .. n) to (0 .. n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.model
      .find({ status: ValidatorStatus.DELEGATE })
      .limit(limit)
      .skip(limit * page);
  }

  public async countDelegate() {
    return this.model.count({ status: ValidatorStatus.DELEGATE });
  }

  public async findJailed(page?: number, limit?: number) {
    // convert page (1 .. n) to (0 .. n-1)
    if (!!page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    if (!limit) {
      limit = LIMIT_WINDOW;
    }
    return this.model
      .find({ status: ValidatorStatus.JAILED })
      .limit(limit)
      .skip(limit * page);
  }

  public async countJailed() {
    return this.model.count({ status: ValidatorStatus.JAILED });
  }

  public async findByAddress(address: string) {
    return this.model.findOne({ address });
  }

  public async findByPubKey(pubKey: string) {
    return this.model.findOne({ pubKey });
  }

  public async bulkInsert(...models: Validator[]) {
    return this.model.create(models);
  }

  public async deleteAll() {
    return this.model.deleteMany({});
  }

  public async getCandidateTotalStaked() {
    const votes = await this.model.find(
      {
        status: { $in: [ValidatorStatus.CANDIDATE, ValidatorStatus.DELEGATE] },
      },
      { totalVotes: true }
    );
    let total = new BigNumber(0);
    for (const v of votes) {
      total = total.plus(v.totalVotes);
    }
    return total.toFixed();
  }

  public async getDelegateTotalStaked() {
    const votes = await this.model.find(
      { status: ValidatorStatus.DELEGATE },
      { totalVotes: true }
    );
    let total = new BigNumber(0);
    for (const v of votes) {
      total = total.plus(v.totalVotes);
    }
    return total.toFixed();
  }
}

export default ValidatorRepo;
