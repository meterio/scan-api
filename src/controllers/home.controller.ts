import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import * as pkg from '../../package.json';
import { MetricName } from '../const';
import Controller from '../interfaces/controller.interface';
import BucketRepo from '../repo/bucket.repo';
import MetricRepo from '../repo/metric.repo';

class HomeController implements Controller {
  public path = '';
  public router = Router();
  private bucketRepo = new BucketRepo();
  private metricRepo = new MetricRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/mtrg`, try$(this.getMTRGCirculating));
    this.router.get(`${this.path}`, try$(this.getHome));
  }

  private getHome = async (req: Request, res: Response) => {
    return res.json({ name: 'scan-api', version: pkg.version });
  };

  private getMTRGCirculating = async (req: Request, res: Response) => {
    const m = await this.metricRepo.findByKey(MetricName.MTRG_CIRCULATION);
    return res.json({ circulation: m.value });
  };
}

export default HomeController;
