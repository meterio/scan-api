import BigNumber from 'bignumber.js';
import { Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName, UNIT_WEI, enumVals } from '../const';
import Controller from '../interfaces/controller.interface';
import MetricRepo from '../repo/metric.repo';

class MetricController implements Controller {
  public path = '/api/metrics';
  public router = Router();
  private metricRepo = new MetricRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/all`, try$(this.getAllMetric));
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
      },
      mtr: {
        price: map[MetricName.MTR_PRICE],
        priceChange: map[MetricName.MTR_PRICE_CHANGE],
      },
      pos: {
        best: Number(map[MetricName.POS_BEST]),
        kblock: Number(map[MetricName.KBLOCK]),
      },
      staking: {
        buckets: Number(map[MetricName.BUCKET_COUNT]),
        candidates: Number(map[MetricName.CANDIDATE_COUNT]),
        validators: Number(map[MetricName.STAKEHOLDER_COUNT]),
        delegates: Number(map[MetricName.DELEGATE_COUNT]),
        onlineNodes: 0, // FIXME: fake data
        totalNodes: Number(map[MetricName.DELEGATE_COUNT]),
        totalStaked: `${totalStaked.dividedBy(UNIT_WEI).toFixed()} MTRG`,
      },
      pow: {
        best: Number(map[MetricName.POW_BEST]),
        difficulty: map[MetricName.DIFFICULTY],
        hashrate: map[MetricName.HASHRATE],
      },
    });
  };
}

export default MetricController;
