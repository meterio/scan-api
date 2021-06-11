import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import BucketRepo from '../repo/bucket.repo';

class HomeController implements Controller {
  public path = '/';
  public router = Router();
  private bucketRepo = new BucketRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, try$(this.getHome));
    this.router.get(`${this.path}/api/dashboard/metric`, try$(this.getMetric));
    this.router.get(`${this.path}/buckets`, try$(this.getBuckets));
  }

  private getHome = async (req: Request, res: Response) => {
    return res.json({ name: 'scan-api' });
  };

  private getMetric = async (req: Request, res: Response) => {
    return res.json({});
  };

  private getBuckets = async (req: Request, res: Response) => {
    const buckets = await this.bucketRepo.findAll();
    return res.json({ buckets });
  };
}

export default HomeController;
