import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Document } from 'mongoose';

import { UNIT_SHANNON } from '../const';
import { Token } from '../const';
import Controller from '../interfaces/controller.interface';
import { Validator } from '../model/validator.interface';
import BlockRepo from '../repo/block.repo';
import BucketRepo from '../repo/bucket.repo';
import ValidatorRepo from '../repo/validator.repo';
import ValidatorRewardRepo from '../repo/validatorReward.repo';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

class ValidatorController implements Controller {
  public path = '/api/validators';
  public router = Router();
  private validatorRepo = new ValidatorRepo();
  private validatorRewardsRepo = new ValidatorRewardRepo();
  private blockRepo = new BlockRepo();
  private bucketRepo = new BucketRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/count`, try$(this.getValidatorsCount));
    this.router.get(`${this.path}/:address`, try$(this.getValidatorByAddress));
    this.router.get(
      `${this.path}/:address/delegators`,
      try$(this.getDelegatorsByAddress)
    );
    this.router.get(
      `${this.path}/:address/votes`,
      try$(this.getVotesByAddress)
    );
    this.router.get(`${this.path}/candidate`, try$(this.getCandidates));
    this.router.get(`${this.path}/delegate`, try$(this.getDelegates));
    this.router.get(`${this.path}/jailed`, try$(this.getJailed));
    this.router.get(`${this.path}/rewards`, try$(this.getPosRewards));
    this.router.get(
      `${this.path}/rewards/:epoch`,
      try$(this.getPosRewardsByEpoch)
    );
  }
  private getDelegatorsByAddress = async (req: Request, res: Response) => {
    const { address } = req.params;
    const buckets = await this.bucketRepo.findByCandidate(address);
    if (!buckets) {
      return res.json({ delegators: [] });
    }
    let total = new BigNumber(0);
    let dMap: { [key: string]: BigNumber } = {};
    for (const b of buckets) {
      total = total.plus(b.totalVotes);
      const voter = b.owner.toLowerCase();
      if (voter in dMap) {
        const v = dMap[voter];
        dMap[voter] = v.plus(b.totalVotes);
      } else {
        dMap[voter] = b.totalVotes;
      }
    }
    let delegators = [];
    for (const addr in dMap) {
      const amount = dMap[addr];
      delegators.push({
        amount: amount.toFixed(),
        address: addr,
        amountStr: fromWei(amount, 2) + ' MTRG',
        percent: amount.dividedBy(total).times(100).toFixed(2) + '%',
      });
    }
    return res.json({ delegators });
  };

  private getVotesByAddress = async (req: Request, res: Response) => {
    const { address } = req.params;
    const buckets = await this.bucketRepo.findByCandidate(address);
    if (!buckets) {
      return res.json({ votes: [] });
    }
    return res.json({
      votes: buckets.map((b) => {
        return {
          id: b.id,
          address: b.owner,
          value: b.value,
          valueStr: fromWei(b.value, 2) + ' ' + Token[b.token],
          totalVotes: b.totalVotes,
          totalVotesStr: fromWei(b.totalVotes, 2) + ' ' + Token[b.token],
          timestamp: b.createTime,
        };
      }),
    });
  };

  private getValidatorByAddress = async (req: Request, res: Response) => {
    const { address } = req.params;
    const validator = await this.validatorRepo.findByAccount(address);
    if (!validator || validator.length <= 0) {
      return res.json({ validator: {} });
    }
    return res.json({ validator: validator[0] });
  };

  private getValidatorsCount = async (req: Request, res: Response) => {
    const validatorCount = await this.validatorRepo.countAll();
    if (validatorCount <= 0) {
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
    const candidates = await this.validatorRepo.countCandidatesByFilter('');
    const delegates = await this.validatorRepo.countDelegatesByFilter('');
    const jailed = await this.validatorRepo.countJailedByFilter('');
    return res.json({
      totalStaked: candidateTotalStaked,
      totalStakedStr: `${fromWei(candidateTotalStaked)} MTRG`,
      totalDelegateStaked: delegateTotalStaked,
      totalDelegateStakedStr: `${fromWei(delegateTotalStaked)} MTRG`,
      onlineNode: 0, // FIXME: fake stub
      totalNode: delegates,
      delegates,
      candidates,
      jailed,
    });
  };

  private convertCandidate = (v: Validator & Document) => {
    return {
      name: v.name,
      address: v.address,
      netAddr: `${v.ipAddress}:${v.port}`,
      pubKey: v.pubKey,

      'commission%': `${new BigNumber(v.commission)
        .dividedBy(UNIT_SHANNON)
        .times(100)
        .toPrecision(2)}%`,
      totalVotes: v.totalVotes.toFixed(),
      totalVotesStr: `${fromWei(v.totalVotes, 2)} MTRG`,
      upTime: '100%', // FIXME: fake stub
    };
  };

  private getCandidates = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countCandidatesByFilter(filter);
    if (count <= 0) {
      return res.json({ totalPage: 0, candidates: [] });
    }
    const candidates = await this.validatorRepo.findCandidatesByFilter(
      filter,
      page,
      limit
    );
    return res.json({
      totalPage: Math.ceil(count / limit),
      candidates: candidates.map(this.convertCandidate),
    });
  };

  private convertDelegate = (v: Validator & Document, totalStaked: string) => {
    return {
      name: v.name,
      address: v.address,
      netAddr: `${v.ipAddress}:${v.port}`,
      // pubKey: v.pubKey,

      votingPower: v.votingPower.toFixed(),
      votingPowerStr: `${fromWei(v.votingPower, 2)} MTRG`,
      'commission%': `${new BigNumber(v.delegateCommission)
        .dividedBy(UNIT_SHANNON)
        .times(100)
        .toPrecision(2)}%`,
      'shares%': `${v.votingPower
        .dividedBy(totalStaked)
        .times(100)
        .toPrecision(2)} %`,
      'up48h%': '100%', // FIXME: fake data
      totalPoints: v.totalPoints,
      upTime: '100%', // FIXME: fake stub
    };
  };

  private getDelegates = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countDelegatesByFilter(filter);
    if (count <= 0) {
      return res.json({ totalPage: 0, delegates: [] });
    }
    const delegates = await this.validatorRepo.findDelegatesByFilter(
      filter,
      page,
      limit
    );
    const delegateTotalStaked = await this.validatorRepo.getDelegateTotalStaked();
    return res.json({
      totalPage: Math.ceil(count / limit),
      delegates: delegates.map((d) =>
        this.convertDelegate(d, delegateTotalStaked)
      ),
    });
  };

  private convertJailed = (v: Validator & Document) => {
    return {
      name: v.name,
      address: v.address,
      netAddr: `${v.ipAddress}:${v.port}`,
      // pubKey: v.pubKey,

      totalPoints: v.totalPoints,
      bailAmount: `${fromWei(v.bailAmount, 2)} MTRG`,
      jailedTime: v.jailedTime,
      infractins: v.infractions,
      upTime: '100%', // FIXME: fake stub
    };
  };

  private getJailed = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countJailedByFilter(filter);
    if (count <= 0) {
      return res.json({ totalPage: 0, jailed: [] });
    }
    const jailed = await this.validatorRepo.findJailedByFilter(
      filter,
      page,
      limit
    );
    return res.json({
      totalPage: Math.ceil(count / limit),
      jailed: jailed.map(this.convertJailed),
    });
  };

  private getPosRewards = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const rewards = await this.validatorRewardsRepo.findAll(page, limit);
    const count = await this.validatorRewardsRepo.countAll();
    if (!rewards) {
      return res.json({ totalPage: 0, rewards: [] });
    }
    const epochs = rewards.map((r) => r.epoch);
    const blks = await this.blockRepo.findKBlocksByEpochs(epochs);
    let eMap = {};
    for (const b of blks) {
      eMap[b.epoch] = { timestamp: b.timestamp, number: b.number };
    }
    return res.json({
      totalPage: Math.ceil(count / limit),
      rewards: rewards.map((r) => {
        const d = eMap[r.epoch];
        return {
          ...r.toSummary(),
          timestamp: d?.timestamp,
          height: d.number,
        };
      }),
    });
  };

  private getPosRewardsByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const reward = await this.validatorRewardsRepo.findByEpoch(parseInt(epoch));
    if (!reward) {
      return res.json({
        epoch,
        timestamp: 0,
        height: 0,
        totalReward: '0',
        baseReward: '0',
        rewards: [],
      });
    }
    const epochs = [parseInt(epoch)];
    const blks = await this.blockRepo.findKBlocksByEpochs(epochs);
    const b = blks[0];
    return res.json({
      timestamp: b.timestamp,
      height: b.number,
      epoch: reward.epoch,
      baseReward: reward.baseReward.toFixed(),
      totalReward: reward.baseReward.toFixed(),
      rewards: reward.rewards.map((item) => {
        return { address: item.address, amount: item.amount.toFixed() };
      }),
    });
  };
}
export default ValidatorController;
