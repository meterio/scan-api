import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { UNIT_SHANNON, UNIT_WEI, ValidatorStatus } from '../const';
import Controller from '../interfaces/controller.interface';
import ValidatorRepo from '../repo/validator.repo';

class ValidatorController implements Controller {
  public path = '/api/validators';
  public router = Router();
  private validatorRepo = new ValidatorRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, try$(this.getAllValidators));
  }

  private getAllValidators = async (req: Request, res: Response) => {
    const validators = await this.validatorRepo.findAll();
    if (!validators) {
      return res.json({
        totalStaked: 0,
        onlineNode: 0,
        totalNode: 0,
        delegates: [],
        candidates: [],
        jailed: [],
      });
    }
    let delegates = [],
      candidates = [],
      jailed = [];
    let candidateTotalVotes = new BigNumber(0);
    let delegateTotalVotes = new BigNumber(0);
    for (const v of validators) {
      switch (v.status) {
        case ValidatorStatus.CANDIDATE:
          candidateTotalVotes = candidateTotalVotes.plus(v.totalVotes);
          break;
        case ValidatorStatus.DELEGATE:
          delegateTotalVotes = delegateTotalVotes.plus(v.votingPower);
      }
    }
    for (const v of validators) {
      const basic = {
        name: v.name,
        address: v.address,
        netAddr: `${v.ipAddress}:${v.port}`,
        pubKey:
          v.pubKey.substr(0, 8) +
          '...' +
          v.pubKey.substr(v.pubKey.length - 8, 8),
      };
      switch (v.status) {
        case ValidatorStatus.CANDIDATE:
          candidates.push({
            ...basic,
            'commission%': `${new BigNumber(v.commission)
              .dividedBy(UNIT_SHANNON)
              .times(100)
              .toPrecision(2)}%`,
            totalVotes: `${v.totalVotes.dividedBy(UNIT_WEI).toFixed()} MTRG`,
          });
          break;
        case ValidatorStatus.DELEGATE:
          candidates.push({
            ...basic,
            'commission%': `${new BigNumber(v.commission)
              .dividedBy(UNIT_SHANNON)
              .times(100)
              .toPrecision(2)}%`,
            totalVotes: `${v.totalVotes.dividedBy(UNIT_WEI).toFixed()} MTRG`,
          });
          delegates.push({
            ...basic,
            'commission%': `${new BigNumber(v.delegateCommission)
              .dividedBy(UNIT_SHANNON)
              .times(100)
              .toPrecision(2)}%`,
            votingPower: `${v.votingPower.dividedBy(UNIT_WEI).toFixed()} MTRG`,
            'shares%': `${v.votingPower
              .dividedBy(delegateTotalVotes)
              .times(100)
              .toPrecision(2)} %`,
            'up48h%': '100%', // FIXME: fake data
            totalPoints: v.totalPoints,
          });
          break;
        case ValidatorStatus.JAILED:
          jailed.push({
            ...basic,
            totalPoints: v.totalPoints,
            bailAmount: `${new BigNumber(v.bailAmount).dividedBy(UNIT_WEI)}`,
            jailedTime: v.jailedTime,
            infractins: v.infractions,
          });
      }
    }
    return res.json({
      totalStaked: `${candidateTotalVotes.dividedBy(UNIT_WEI).toFixed()} MTRG`,
      totalDelegateStaked: `${delegateTotalVotes
        .dividedBy(UNIT_WEI)
        .toFixed()} MTRG`,
      onlineNode: 0, // FIXME: fake stub
      totalNode: delegates.length,
      delegates,
      candidates,
      jailed,
    });
  };
}
export default ValidatorController;
