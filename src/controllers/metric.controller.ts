import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName, enumVals } from '../const';
import Controller from '../interfaces/controller.interface';
import HeadRepo from '../repo/head.repo';
import MetricRepo from '../repo/metric.repo';
import { fromWei } from '../utils/utils';

class MetricController implements Controller {
  public path = '/api/metrics';
  public router = Router();
  private metricRepo = new MetricRepo();
  private headRepo = new HeadRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, try$(this.getAllMetric));
    this.router.get(`${this.path}/pow`, try$(this.getPowMetric));
    this.router.get(`${this.path}/pos`, try$(this.getPosMetric));
    this.router.get(`${this.path}/head`, try$(this.getHeadMetric));
    this.router.get(`${this.path}/chart`, try$(this.getChart));
  }

  private getAllMetric = async (req, res) => {
    const names = enumVals(MetricName);
    const metrics = await this.metricRepo.findByKeys(names);
    let map: { [key: string]: string } = {};
    for (const m of metrics) {
      map[m.key] = m.value;
    }

    const buckets = map[MetricName.BUCKETS];

    let totalStaked = new BigNumber(0);
    for (const b of JSON.parse(buckets)) {
      totalStaked = totalStaked.plus(b.totalVotes);
    }

    return res.json({
      mtrg: {
        price: map[MetricName.MTRG_PRICE],
        priceChange: map[MetricName.MTRG_PRICE_CHANGE],
        avgDailyReward: '235 MTRG', // FIXME: fake data
        circulation: new BigNumber(map[MetricName.MTRG_CIRCULATION])
          .dividedBy(1e18)
          .toFixed(),
      },
      mtr: {
        price: map[MetricName.MTR_PRICE],
        priceChange: map[MetricName.MTR_PRICE_CHANGE],
        circulation: new BigNumber(map[MetricName.MTR_CIRCULATION])
          .dividedBy(1e18)
          .toFixed(),
      },
      pos: {
        best: Number(map[MetricName.POS_BEST]),
        kblock: Number(map[MetricName.KBLOCK]),
        epoch: Number(map[MetricName.EPOCH]),
        seq: Number(map[MetricName.SEQ]),
      },
      staking: {
        buckets: Number(map[MetricName.BUCKET_COUNT]),
        candidates: Number(map[MetricName.CANDIDATE_COUNT]),
        validators: Number(map[MetricName.STAKEHOLDER_COUNT]),
        delegates: Number(map[MetricName.DELEGATE_COUNT]),
        onlineNodes: 0, // FIXME: fake data
        totalNodes: Number(map[MetricName.DELEGATE_COUNT]),
        totalStaked: `${fromWei(totalStaked)} MTRG`,
      },
      pow: {
        best: Number(map[MetricName.POW_BEST]),
        difficulty: map[MetricName.DIFFICULTY],
        hashrate: map[MetricName.HASHRATE],
        costParity: map[MetricName.COST_PARITY],
        rewardPerDay: map[MetricName.REWARD_PER_DAY],
      },
    });
  };

  private getPowMetric = async (req, res) => {
    const names = enumVals(MetricName);
    const metrics = await this.metricRepo.findByKeys(names);
    let map: { [key: string]: string } = {};
    for (const m of metrics) {
      map[m.key] = m.value;
    }

    const hashrate = Number(map[MetricName.HASHRATE]);
    return res.json({
      mtr: {
        price: map[MetricName.MTR_PRICE],
        priceChange: map[MetricName.MTR_PRICE_CHANGE],
        circulation: new BigNumber(map[MetricName.MTR_CIRCULATION])
          .dividedBy(1e18)
          .toFixed(),
      },
      pow: {
        best: Number(map[MetricName.POW_BEST]),
        difficulty: map[MetricName.DIFFICULTY],
        hashrate,
        costParity: map[MetricName.COST_PARITY],
        rewardPerDay: map[MetricName.REWARD_PER_DAY],
      },
    });
  };

  private getPosMetric = async (req, res) => {
    const names = enumVals(MetricName);
    const metrics = await this.metricRepo.findByKeys(names);
    let map: { [key: string]: string } = {};
    for (const m of metrics) {
      map[m.key] = m.value;
    }

    const buckets = map[MetricName.BUCKETS];

    let totalStaked = new BigNumber(0);
    for (const b of JSON.parse(buckets)) {
      totalStaked = totalStaked.plus(b.totalVotes);
    }

    return res.json({
      pos: {
        best: Number(map[MetricName.POS_BEST]),
        kblock: Number(map[MetricName.KBLOCK]),
        epoch: Number(map[MetricName.EPOCH]),
        seq: Number(map[MetricName.SEQ]),
      },
      staking: {
        buckets: Number(map[MetricName.BUCKET_COUNT]),
        candidates: Number(map[MetricName.CANDIDATE_COUNT]),
        validators: Number(map[MetricName.STAKEHOLDER_COUNT]),
        delegates: Number(map[MetricName.DELEGATE_COUNT]),
        onlineNodes: 0, // FIXME: fake data
        totalNodes: Number(map[MetricName.DELEGATE_COUNT]),
        totalStaked: `${fromWei(totalStaked)} MTRG`,
      },
    });
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
