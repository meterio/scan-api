import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName, enumVals } from '../const';
import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import HeadRepo from '../repo/head.repo';
import MetricRepo from '../repo/metric.repo';
import TxRepo from '../repo/tx.repo';
import { fromWei } from '../utils/utils';

class MetricController implements Controller {
  public path = '/api/metrics';
  public router = Router();
  private metricRepo = new MetricRepo();
  private headRepo = new HeadRepo();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private accountRepo = new AccountRepo();

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
    const txsCount = await this.txRepo.count();
    const buckets = map[MetricName.BUCKETS];

    let totalStaked = new BigNumber(0);
    for (const b of JSON.parse(buckets)) {
      totalStaked = totalStaked.plus(b.totalVotes);
    }

    const nonZeroCount = this.accountRepo.countNonZero();
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
        validators: Number(map[MetricName.STAKEHOLDER_COUNT]),
        delegates: Number(map[MetricName.DELEGATE_COUNT]),
        onlineNodes: 0, // FIXME: fake data
        totalNodes: Number(map[MetricName.DELEGATE_COUNT]),
        totalStaked: totalStaked,
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

  private getAllMetric = async (req, res) => {
    const posData = await this.getPosData();
    const powData = await this.getPowData();
    const tokenData = await this.getTokenData();

    return res.json({
      ...tokenData,
      ...powData,
      ...posData,
    });
  };

  private getPowMetric = async (req, res) => {
    const powData = await this.getPowData();
    return res.json(powData);
  };

  private getPosMetric = async (req, res) => {
    const posData = await this.getPosData();
    return res.json(posData);
  };

  private getTokenMetric = async (req, res) => {
    const tokenData = await this.getTokenData();
    return res.json(tokenData);
  };

  private getHeadMetric = async (req, res) => {
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

  private getChart = async (req, res) => {
    const end = Math.floor(+new Date() / 1000);
    const start = end - 7 * 24 * 3600;
    const step = '24h';
    const hashrates = await axios.get(
      `http://monitor.meter.io:9090/api/v1/query_range?query=bitcoind_blockchain_hashrate&start=${start}&end=${end}&step=${step}`
    );
    console.log(hashrates.data);

    if (!hashrates || !hashrates.data || !hashrates.data.data) {
      return res.json({
        hashrates: {
          mainnet: [],
          testnet: [],
        },
      });
    }
    let mainrates = [];
    let testrates = [];

    for (const m of hashrates.data.data.result) {
      if (mainrates.length <= 0 && m.metric.job === 'mainnet_bitcoin') {
        mainrates.push(...m.values);
      }
      if (testrates.length <= 0 && m.metric.job === 'shoal_bitcoin') {
        testrates.push(...m.values);
      }
    }
    return res.json({ hashrates: { mainnet: mainrates, testnet: testrates } });
  };
}

export default MetricController;
