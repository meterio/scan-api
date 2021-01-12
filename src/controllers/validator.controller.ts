import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { LIMIT_WINDOW, UNIT_SHANNON } from '../const';
import Controller from '../interfaces/controller.interface';
import BlockRepo from '../repo/block.repo';
import ValidatorRepo from '../repo/validator.repo';
import ValidatorRewardRepo from '../repo/validatorReward.repo';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

class ValidatorController implements Controller {
  public path = '/api/validators';
  public router = Router();
  private validatorRepo = new ValidatorRepo();
  private validatorRewardsRepo = new ValidatorRewardRepo();
  private blockRepo = new BlockRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/count`, try$(this.getValidatorsCount));
    this.router.get(`${this.path}/candidate`, try$(this.getCandidates));
    this.router.get(`${this.path}/delegate`, try$(this.getDelegates));
    this.router.get(`${this.path}/jailed`, try$(this.getJailed));
    this.router.get(`${this.path}/rewards`, try$(this.getPosRewards));
  }

  private getValidatorsCount = async (req: Request, res: Response) => {
    const validators = await this.validatorRepo.findAll();
    if (!validators) {
      return res.json({
        totalStaked: 0,
        onlineNode: 0,
        totalNode: 0,
        delegates: 0,
        candidates: 0,
        jailed: 0,
      });
    }
    const candidateTotalStaked = await this.validatorRepo.getCandidateTotalStaked();
    const delegateTotalStaked = await this.validatorRepo.getDelegateTotalStaked();
    const candidates = await this.validatorRepo.countCandidate();
    const delegates = await this.validatorRepo.countDelegate();
    const jailed = await this.validatorRepo.countJailed();
    return res.json({
      totalStaked: `${fromWei(candidateTotalStaked)} MTRG`,
      totalDelegateStaked: `${fromWei(delegateTotalStaked)} MTRG`,
      onlineNode: 0, // FIXME: fake stub
      totalNode: delegates,
      delegates,
      candidates,
      jailed,
    });
  };

  private getCandidates = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const candidates = await this.validatorRepo.findCandidates(page, limit);
    if (!candidates) {
      return res.json({ total: 0, candidates: [] });
    }
    const count = await this.validatorRepo.countCandidate();
    let results = [];
    for (const v of candidates) {
      results.push({
        name: v.name,
        address: v.address,
        netAddr: `${v.ipAddress}:${v.port}`,
        pubKey: v.pubKey,

        'commission%': `${new BigNumber(v.commission)
          .dividedBy(UNIT_SHANNON)
          .times(100)
          .toPrecision(2)}%`,
        totalVotes: `${fromWei(v.totalVotes)} MTRG`,
        upTime: '100%', // FIXME: fake stub
      });
    }
    return res.json({
      total: count,
      candidates: results,
    });
  };

  private getDelegates = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const delegates = await this.validatorRepo.findDelegate(page, limit);
    if (!delegates) {
      return res.json({ total: 0, delegates: [] });
    }
    const delegateTotalStaked = await this.validatorRepo.getDelegateTotalStaked();
    const count = await this.validatorRepo.countDelegate();
    let results = [];
    for (const v of delegates) {
      results.push({
        name: v.name,
        address: v.address,
        netAddr: `${v.ipAddress}:${v.port}`,
        // pubKey: v.pubKey,

        votingPower: `${fromWei(v.votingPower)} MTRG`,
        'commission%': `${new BigNumber(v.delegateCommission)
          .dividedBy(UNIT_SHANNON)
          .times(100)
          .toPrecision(2)}%`,
        'shares%': `${v.votingPower
          .dividedBy(delegateTotalStaked)
          .times(100)
          .toPrecision(2)} %`,
        'up48h%': '100%', // FIXME: fake data
        totalPoints: v.totalPoints,
        upTime: '100%', // FIXME: fake stub
      });
    }
    return res.json({
      total: count,
      delegates: results,
    });
  };

  private getJailed = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const jailed = await this.validatorRepo.findJailed(page, limit);
    if (jailed) {
      return res.json({ total: 0, jailed: [] });
    }
    const count = await this.validatorRepo.countJailed();
    let results = [];
    for (const v of jailed) {
      results.push({
        name: v.name,
        address: v.address,
        netAddr: `${v.ipAddress}:${v.port}`,
        // pubKey: v.pubKey,

        totalPoints: v.totalPoints,
        bailAmount: `${fromWei(v.bailAmount)} MTRG`,
        jailedTime: v.jailedTime,
        infractins: v.infractions,
        upTime: '100%', // FIXME: fake stub
      });
    }
    return res.json({
      total: count,
      jailed: results,
    });
  };

  private getPosRewards = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const rewards = await this.validatorRewardsRepo.findAll(page, limit);
    if (!rewards) {
      return res.json({ rewards: [] });
    }
    const epochs = rewards.map((r) => r.epoch);
    const blks = await this.blockRepo.findKBlocksByEpochs(epochs);
    let eMap = {};
    for (const b of blks) {
      eMap[b.epoch] = { timestamp: b.timestamp, number: b.number };
    }
    return res.json({
      rewards: rewards.map((r) => {
        const d = eMap[r.epoch];
        return { ...r.toSummary(), timestamp: d?.timestamp, height: d.number };
      }),
    });
  };
}
export default ValidatorController;
