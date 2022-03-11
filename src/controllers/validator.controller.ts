import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Document } from 'mongoose';

import { BALANCE_SYM, MetricName, UNIT_SHANNON } from '../const';
import { Token } from '../const';
import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

import {
  BlockRepo,
  BucketRepo,
  EpochRewardRepo,
  EpochRewardSummaryRepo,
  MetricRepo,
  ValidatorRepo,
  BigNumber,
  Validator
} from '@meterio/scan-db';

const MissingLeaderPenalty = 1000;
const MissingProposerPenalty = 20;
const MissingVoterPenalty = 2;
const DoubleSignerPenalty = 2000;
const PhaseOutEpoch = 4;
const WipeOutEpoch = PhaseOutEpoch * 2;
class ValidatorController implements Controller {
  public path = '/api/validators';
  public router = Router();
  private validatorRepo = new ValidatorRepo();
  private bucketRepo = new BucketRepo();
  private epochRewardSummaryRepo = new EpochRewardSummaryRepo();
  private epochRewardRepo = new EpochRewardRepo();
  private metricRepo = new MetricRepo();
  private blockRepo = new BlockRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/count`, try$(this.getValidatorsCount));
    this.router.get(`${this.path}/candidate`, try$(this.getCandidates));
    this.router.get(`${this.path}/delegate`, try$(this.getDelegates));
    this.router.get(`${this.path}/jailed`, try$(this.getJailed));
    this.router.get(`${this.path}/stats`, try$(this.getStats));
    this.router.get(`${this.path}/rewards`, try$(this.getEpochRewards));
    this.router.get(
      `${this.path}/rewards/:epoch`,
      try$(this.getEpochRewardByEpoch)
    );

    this.router.get(`${this.path}/:address`, try$(this.getValidatorByAddress));
    this.router.get(
      `${this.path}/:address/delegators`,
      try$(this.getDelegatorsByAddress)
    );
    this.router.get(
      `${this.path}/:address/votes`,
      try$(this.getVotesByAddress)
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
          value: b.value.toFixed(),
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
    const candidateTotalStaked =
      await this.validatorRepo.getCandidateTotalStaked();
    const delegateTotalStaked =
      await this.validatorRepo.getDelegateTotalStaked();
    const candidates = await this.validatorRepo.countCandidatesByFilter('');
    const delegates = await this.validatorRepo.countDelegatesByFilter('');
    const jailed = await this.validatorRepo.countJailedByFilter('');
    return res.json({
      totalStaked: candidateTotalStaked,
      totalStakedStr: `${fromWei(candidateTotalStaked)} ${BALANCE_SYM}`,
      totalDelegateStaked: delegateTotalStaked,
      totalDelegateStakedStr: `${fromWei(delegateTotalStaked)} ${BALANCE_SYM}`,
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
      totalVotesStr: `${fromWei(v.totalVotes, 2)} ${BALANCE_SYM}`,
      totalPoints: v.totalPoints ? Number(v.totalPoints.toFixed()) : 0,
    };
  };

  private getCandidates = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countCandidatesByFilter(filter);
    if (count <= 0) {
      return res.json({ totalRows: 0, candidates: [] });
    }
    const candidates = await this.validatorRepo.findCandidatesByFilter(
      filter,
      page,
      limit
    );
    return res.json({
      totalRows: count,
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
      votingPowerStr: `${fromWei(v.votingPower, 2)} ${BALANCE_SYM}`,
      'commission%': `${new BigNumber(v.delegateCommission)
        .dividedBy(UNIT_SHANNON)
        .times(100)
        .toPrecision(2)}%`,
      'shares%': `${v.votingPower
        .dividedBy(totalStaked)
        .times(100)
        .toPrecision(2)}%`,
      totalPoints: v.totalPoints ? Number(v.totalPoints.toFixed()) : 0,
    };
  };

  private getDelegates = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countDelegatesByFilter(filter);
    if (count <= 0) {
      return res.json({ totalRows: 0, delegates: [] });
    }
    const delegates = await this.validatorRepo.findDelegatesByFilter(
      filter,
      page,
      limit
    );
    const delegateTotalStaked =
      await this.validatorRepo.getDelegateTotalStaked();
    return res.json({
      totalRows: count,
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

      totalPoints: v.totalPoints ? Number(v.totalPoints.toFixed()) : 0,
      bailAmount: `${fromWei(v.bailAmount, 2)} ${BALANCE_SYM}`,
      jailedTime: v.jailedTime,
      infractions: v.infractions,
    };
  };

  private getJailed = async (req: Request, res: Response) => {
    const { search } = req.query;
    const filter = search ? search.toString() : '';
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.validatorRepo.countJailedByFilter(filter);
    if (count <= 0) {
      return res.json({ totalRows: 0, jailed: [] });
    }
    const jailed = await this.validatorRepo.findJailedByFilter(
      filter,
      page,
      limit
    );
    return res.json({
      totalRows: count,
      jailed: jailed.map(this.convertJailed),
    });
  };

  private getStats = async (req: Request, res: Response) => {
    const stats = await this.metricRepo.findByKey(MetricName.STATS);
    const bests = await this.blockRepo.findRecentWithPage(1, 1);
    const best = bests[0];
    const epoch = best.epoch;
    const summaries = {};
    const infractions = {};
    for (const s of JSON.parse(stats.value)) {
      summaries[s.address] = {
        address: s.address,
        name: s.name,
        totalPoints: s.totalPoints,
      };
      if (!(s.address.toLowerCase() in infractions)) {
        infractions[s.address] = [];
      }
      if (
        s.infractions.missingLeader &&
        s.infractions.missingLeader.counter > 0
      ) {
        for (const info of s.infractions.missingLeader.info) {
          const diff = epoch - info.epoch;
          let weight = 1;
          if (diff > WipeOutEpoch) {
            weight = 0;
          } else if (diff > PhaseOutEpoch) {
            weight = 0.5;
          }
          infractions[s.address.toLowerCase()].push({
            type: 'missing leader',
            epoch: info.epoch,
            round: info.round,
            explain: `epoch ${info.epoch}, round ${info.round}`,
            penalty: MissingLeaderPenalty,
            actualPenalty: MissingLeaderPenalty * weight,
          });
        }
      }
      console.log(s.infractions.missingProposer);
      if (
        s.infractions.missingProposer &&
        s.infractions.missingProposer.counter > 0
      ) {
        for (const info of s.infractions.missingProposer.info) {
          const diff = epoch - info.epoch;
          let weight = 1;
          if (diff > WipeOutEpoch) {
            weight = 0;
          } else if (diff > PhaseOutEpoch) {
            weight = 0.5;
          }
          infractions[s.address.toLowerCase()].push({
            type: 'missing proposer',
            epoch: info.epoch,
            height: info.height,
            explain: `epoch ${info.epoch}, height ${info.height}`,
            penalty: MissingProposerPenalty,
            actualPenalty: MissingProposerPenalty * weight,
          });
        }
      }
      if (
        s.infractions.missingVoter &&
        s.infractions.missingVoter.counter > 0
      ) {
        for (const info of s.infractions.missingVoter.info) {
          const diff = epoch - info.epoch;
          let weight = 1;
          if (diff > WipeOutEpoch) {
            weight = 0;
          } else if (diff > PhaseOutEpoch) {
            weight = 0.5;
          }
          infractions[s.address.toLowerCase()].push({
            type: 'missing vote',
            epoch: info.epoch,
            height: info.height,
            explain: `epoch ${info.epoch}, height ${info.height}`,
            penalty: MissingVoterPenalty,
            actualPenalty: MissingVoterPenalty * weight,
          });
        }
      }
      if (
        s.infractions.DoubleSigner &&
        s.infractions.DoubleSigner.counter > 0
      ) {
        for (const info of s.infractions.DoubleSigner.info) {
          const diff = epoch - info.epoch;
          let weight = 1;
          if (diff > WipeOutEpoch) {
            weight = 0;
          } else if (diff > PhaseOutEpoch) {
            weight = 0.5;
          }
          infractions[s.address.toLowerCase()].push({
            type: 'double sign',
            epoch: info.epoch,
            round: info.round,
            height: info.height,
            explain: `epoch ${info.epoch}, round ${info.round}, height ${info.height}`,
            penalty: DoubleSignerPenalty,
            actualPenalty: DoubleSignerPenalty * weight,
          });
        }
      }
    }
    return res.json({ summaries: Object.values(summaries), infractions });
  };

  private getEpochRewards = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const rewards = await this.epochRewardSummaryRepo.findAllWithPage(page, limit);
    const count = await this.epochRewardSummaryRepo.countAll();
    if (!rewards) {
      return res.json({ totalRows: 0, rewards: [] });
    }
    return res.json({
      totalRows: count,
      rewards,
    });
  };

  private getEpochRewardByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const summary = await this.epochRewardSummaryRepo.findByEpoch(
      parseInt(epoch)
    );
    if (!summary) {
      return res.json({
        epoch,
        blockNum: 0,
        timestamp: 0,
        autobidTotal: '0',
        autobidCount: 0,
        transferTotal: '0',
        transferCount: 0,
        totalReward: '0',
        rewards: [],
      });
    }
    const epochRewards = await this.epochRewardRepo.findByEpoch(
      parseInt(epoch)
    );
    let autobidMap = {};
    let transferMap = {};
    for (const r of epochRewards) {
      if (r.type == 'autobid') {
        if (!(r.address in autobidMap)) {
          autobidMap[r.address] = new BigNumber(r.amount);
        } else {
          autobidMap[r.address] = autobidMap[r.address].plus(r.amount);
        }
      }
      if (r.type == 'transfer') {
        if (!(r.address in transferMap)) {
          transferMap[r.address] = new BigNumber(r.amount);
        } else {
          transferMap[r.address] = transferMap[r.address].plus(r.amount);
        }
      }
    }
    const transfers = Object.keys(transferMap).map((addr) => {
      const amount = transferMap[addr];
      return { addr, amount, type: 'transfer' };
    });
    const autobids = Object.keys(autobidMap).map((addr) => {
      const amount = autobidMap[addr];
      return { addr, amount, type: 'autobid' };
    });
    const rewards = transfers.concat(autobids).sort((a, b) => {
      return new BigNumber(a.amount).isGreaterThan(b.amount) ? 1 : -1;
    });

    return res.json({
      epoch,
      summary: summary.toJSON(),
      rewards,
    });
  };
}
export default ValidatorController;
