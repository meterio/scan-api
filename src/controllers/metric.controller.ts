import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Document } from 'mongoose';

import { MetricName, ValidatorStatus, enumVals } from '../const';
import Controller from '../interfaces/controller.interface';
import { Validator } from '../model/validator.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import HeadRepo from '../repo/head.repo';
import MetricRepo from '../repo/metric.repo';
import TransferRepo from '../repo/transfer.repo';
import TxRepo from '../repo/tx.repo';
import ValidatorRepo from '../repo/validator.repo';
import { fromWei } from '../utils/utils';

class MetricController implements Controller {
  public path = '/api/metrics';
  public router = Router();
  private metricRepo = new MetricRepo();
  private headRepo = new HeadRepo();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private transferRepo = new TransferRepo();
  private accountRepo = new AccountRepo();
  private validatorRepo = new ValidatorRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, try$(this.getAllMetric));
    this.router.get(`${this.path}/pow`, try$(this.getPowMetric));
    this.router.get(`${this.path}/pos`, try$(this.getPosMetric));
    this.router.get(`${this.path}/token`, try$(this.getTokenMetric));
    this.router.get(`${this.path}/head`, try$(this.getHeadMetric));
    this.router.get(`${this.path}/chart`, try$(this.getChart));
    this.router.get(`${this.path}/committee`, try$(this.getCommitteeMetric));
    this.router.get(`${this.path}/invalid`, try$(this.getInvalidNodesMetric));
  }

  private getMetricMap = async () => {
    const names = enumVals(MetricName);
    const metrics = await this.metricRepo.findByKeys(names);
    let map: { [key: string]: string } = {};
    for (const m of metrics) {
      map[m.key] = m.value;
    }
    return map;
  };

  private getPosData = async () => {
    let map = await this.getMetricMap();
    const recentBlocks = await this.blockRepo.findRecent(20);
    let avgBlockTime = 2;
    if (recentBlocks && recentBlocks.length > 2) {
      const last = recentBlocks[0];
      const first = recentBlocks[recentBlocks.length - 1];
      avgBlockTime =
        Math.floor(
          (100 * (last.timestamp - first.timestamp)) / (recentBlocks.length - 1)
        ) / 100;
    }
    const txsCount = await this.transferRepo.count();

    const totalStaked = map[MetricName.MTRG_STAKED];
    const totalStakedLocked = map[MetricName.MTRG_STAKED_LOCKED];

    const nonZeroCount = await this.accountRepo.countNonZero();
    return {
      pos: {
        best: Number(map[MetricName.POS_BEST]),
        kblock: Number(map[MetricName.KBLOCK]),
        epoch: Number(map[MetricName.EPOCH]),
        seq: Number(map[MetricName.SEQ]),
        avgBlockTime: avgBlockTime,
        txsCount,
        inflation: '5%',
        addressCount: nonZeroCount,
      },
      staking: {
        buckets: Number(map[MetricName.BUCKET_COUNT]),
        candidates: Number(map[MetricName.CANDIDATE_COUNT]),
        stakeholders: Number(map[MetricName.STAKEHOLDER_COUNT]),
        delegates: Number(map[MetricName.DELEGATE_COUNT]),
        healthyNodes:
          Number(map[MetricName.CANDIDATE_COUNT]) -
          Number(map[MetricName.INVALID_NODES_COUNT]),
        invalidNodes: Number(map[MetricName.INVALID_NODES_COUNT]),
        totalStaked,
        totalCirculationStaked: new BigNumber(totalStaked)
          .minus(totalStakedLocked)
          .toFixed(0),
        totalStakedStr: `${fromWei(totalStaked, 2)} MTRG`,
      },
    };
  };

  private getPowData = async () => {
    let map = await this.getMetricMap();
    return {
      pow: {
        best: Number(map[MetricName.POW_BEST]),
        difficulty: map[MetricName.DIFFICULTY],
        hashrate: map[MetricName.HASHRATE],
        coef: map[MetricName.COEF],
        costParity: map[MetricName.COST_PARITY],
        rewardPerDay: map[MetricName.REWARD_PER_DAY],
      },
    };
  };

  private getTokenData = async () => {
    let map = await this.getMetricMap();
    let avgDailyReward = '0 MTRG';
    try {
      let s = map[MetricName.PRESENT_AUCTION];
      let present = JSON.parse(s);
      if (present.releasedMTRG && Number(present.releasedMTRG)) {
        avgDailyReward =
          new BigNumber(present.releasedMTRG).dividedBy(1e18).toFixed(0) +
          ' MTRG';
      }
    } catch (e) {}

    return {
      mtr: {
        price: map[MetricName.MTR_PRICE],
        priceChange: map[MetricName.MTR_PRICE_CHANGE],
        circulation: new BigNumber(map[MetricName.MTR_CIRCULATION])
          .dividedBy(1e18)
          .toFixed(),
      },

      mtrg: {
        price: map[MetricName.MTRG_PRICE],
        priceChange: map[MetricName.MTRG_PRICE_CHANGE],
        avgDailyReward,
        circulation: new BigNumber(map[MetricName.MTRG_CIRCULATION])
          .dividedBy(1e18)
          .toFixed(),
      },
    };
  };

  private getAllMetric = async (req: Request, res: Response) => {
    const posData = await this.getPosData();
    console.log('got pos data:', posData);
    const powData = await this.getPowData();
    console.log('got pow data: ', powData);
    const tokenData = await this.getTokenData();
    console.log('got token data: ', tokenData);
    let committeeData = await this.getCommitteeData();
    console.log('got committee data: ', committeeData);

    delete committeeData.committee.invalidMembers;
    delete committeeData.committee.healthyMembers;
    delete committeeData.committee.downMembers;
    delete committeeData.committee.jailedMembers;
    return res.json({
      ...tokenData,
      ...powData,
      ...posData,
      ...committeeData,
    });
  };

  private getPowMetric = async (req: Request, res: Response) => {
    const powData = await this.getPowData();
    return res.json(powData);
  };

  private getPosMetric = async (req: Request, res: Response) => {
    const posData = await this.getPosData();
    return res.json(posData);
  };

  private getTokenMetric = async (req: Request, res: Response) => {
    const tokenData = await this.getTokenData();
    return res.json(tokenData);
  };

  private getHeadMetric = async (req: Request, res: Response) => {
    const heads = await this.headRepo.findAll();
    if (!heads || heads.length <= 0) {
      return res.json({
        heads: {},
      });
    }
    let result = {};
    for (const h of heads) {
      result[h.key] = h.num;
    }
    return res.json({ heads: result });
  };

  private getInvalidNodesMetric = async (req: Request, res: Response) => {
    const map = await this.getMetricMap();
    const invalidNodes = map[MetricName.INVALID_NODES];
    const parsed = JSON.parse(invalidNodes);
    return res.json({ invalidNodes: parsed });
  };

  private getCommitteeMetric = async (req: Request, res: Response) => {
    const committeeData = await this.getCommitteeData();
    return res.json(committeeData);
  };

  private async getCommitteeData() {
    const emptyResponse = {
      committee: {
        size: 0,
        healthy: 0,
        down: 0,
        invalid: 0,
        jailed: 0,
        jailedMembers: [],
        healthyMembers: [],
        downMembers: [],
        invalidMembers: [],
      },
    };
    let statusMap = {};
    let nameMap = {};
    const roles = await axios.get(
      `http://monitor.meter.io:9090/api/v1/query?query=pacemaker_role`
    );
    if (!roles || !roles.data || !roles.data.data) {
      return emptyResponse;
    }
    console.log('roles length:', roles.data.data.result.length);
    for (const r of roles.data.data.result) {
      const ip = r.metric.instance;
      const name = r.metric.name;
      statusMap[ip] = r.value && r.value.length >= 2 ? Number(r.value[1]) : -1;
      nameMap[ip] = name;
    }
    const kblocks = await this.blockRepo.findKBlocks(1, 1);
    if (!roles || !kblocks || kblocks.length <= 0) {
      return emptyResponse;
    }

    const block = await this.blockRepo.findByNumber(kblocks[0].number + 1);
    if (!block || block.committee.length <= 0) {
      return emptyResponse;
    }

    const validators = await this.validatorRepo.findAll();
    let vMap: { [key: string]: Validator & Document } = {}; // validator map [ip -> validator obj]
    validators.forEach((v) => {
      const ecdsaKey = v.pubKey.split(':::')[0];
      vMap[ecdsaKey] = v;
    });

    let jMap: { [key: string]: boolean } = {}; // jailed map [address -> injail]
    const jailedVal = await this.metricRepo.findByKey(MetricName.JAILED);
    if (jailedVal) {
      const injail = JSON.parse(jailedVal.value);
      injail.map((j) => {
        jMap[j.address] = true;
      });
    }

    let healthy = 0,
      invalid = 0,
      down = 0,
      jailed = 0;
    let healthyMembers = [],
      invalidMembers = [],
      downMembers = [],
      jailedMembers = [];

    let visited = {};
    let size = 0;
    console.log('block.committee length:', block.committee.length);
    for (const m of block.committee) {
      const ip = m.netAddr.toLowerCase().split(':')[0];
      if (visited[ip]) {
        continue;
      }
      size++;
      visited[ip] = true;

      let status = -1;
      let error = undefined;
      if (ip in statusMap) {
        status = Number(statusMap[ip]);
      }
      const v = vMap[m.pubKey];
      if (!v) {
        error = 'no validator info found (possible key mismatch)';
      } else if (v.ipAddress !== ip) {
        error = 'ip address mismatch with validator info';
      }
      const name = v ? v.name : nameMap[ip] || '';
      const injail = v ? v.status === ValidatorStatus.JAILED : false;
      const member = {
        index: m.index,
        name,
        memberPubkey: m.pubKey,
        address: v ? v.address : '0x',
        ip,
        status,
        error,
      };
      if (injail) {
        jailed++;
        jailedMembers.push(member);
      }
      switch (status) {
        case 0:
          invalid++;
          invalidMembers.push(member);
          break;
        case 1: // validator
        case 2: // proposer
          healthy++;
          healthyMembers.push(member);
          break;
        case -1:
          down++;
          downMembers.push(member);
      }
    }

    /*
    size = healthy + down + invalid
    jailed refers to the number of members in jail
    */
    return {
      committee: {
        size,
        healthy,
        down,
        invalid,
        jailed,
        healthyMembers,
        downMembers,
        invalidMembers,
        jailedMembers,
      },
    };
  }

  private getChart = async (req: Request, res: Response) => {
    const end = Math.floor(+new Date() / 1000);
    const start = end - 7 * 24 * 3600;
    const step = '24h';
    const hashrates = await axios.get(
      `http://monitor.meter.io:9090/api/v1/query_range?query=bitcoind_blockchain_hashrate&start=${start}&end=${end}&step=${step}`
    );
    const diffs = await axios.get(
      `http://monitor.meter.io:9090/api/v1/query_range?query=bitcoind_blockchain_difficulty&start=${start}&end=${end}&step=${step}`
    );

    if (
      !hashrates ||
      !hashrates.data ||
      !hashrates.data.data ||
      !diffs ||
      !diffs.data ||
      !diffs.data.data
    ) {
      return res.json({
        hashrates: { mainnet: [], testnet: [] },
        diffs: { mainnet: [], testnet: [] },
      });
    }
    let mainrates = [];
    let testrates = [];
    let maindiffs = [];
    let testdiffs = [];

    for (const m of hashrates.data.data.result) {
      if (mainrates.length <= 0 && m.metric.job === 'mainnet_bitcoin') {
        mainrates.push(...m.values);
      }
      if (testrates.length <= 0 && m.metric.job === 'shoal_bitcoin') {
        testrates.push(...m.values);
      }
    }
    for (const m of diffs.data.data.result) {
      if (maindiffs.length <= 0 && m.metric.job === 'mainnet_bitcoin') {
        maindiffs.push(...m.values);
      }
      if (testdiffs.length <= 0 && m.metric.job === 'shoal_bitcoin') {
        testdiffs.push(...m.values);
      }
    }

    return res.json({
      hashrates: { mainnet: mainrates, testnet: testrates },
      diffs: { mainnet: maindiffs, testnet: testdiffs },
    });
  };
}

export default MetricController;
