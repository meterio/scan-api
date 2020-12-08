import { Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName, enumVals } from '../const';
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
    this.router.get(`${this.path}/all`, try$(this.getMetric));
  }

  private getMetric = async (req, res) => {
    const names = enumVals(MetricName);
    const metrics = await this.metricRepo.findByKeys(names);
    let map: { [key: string]: string } = {};
    for (const m of metrics) {
      map[m.key] = m.value;
    }

    return res.json({
      mtrg: {
        price: map[MetricName.MTRG_PRICE],
        priceChange: map[MetricName.MTRG_PRICE_CHANGE],
        avgDailyReward: '235000000000000000000', // Wei
        totalStaked: '12345000000000000000000', // Wei
      },
      mtr: {
        price: map[MetricName.MTR_PRICE],
        priceChange: map[MetricName.MTR_PRICE_CHANGE],
      },
      pos: {
        best: Number(map[MetricName.POS_BEST]),
        kblock: Number(map[MetricName.KBLOCK]),
        validators: 11,
        onlineNodes: 11,
        totalNodes: 11,
      },
      pow: {
        best: Number(map[MetricName.POW_BEST]),
        difficulty: Number(map[MetricName.DIFFICULTY]),
        hashrate: Number(map[MetricName.HASHRATE]),
      },
    });
  };
}

export default MetricController;
