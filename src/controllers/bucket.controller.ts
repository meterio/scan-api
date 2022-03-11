import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

import { BucketRepo } from '@meterio/scan-db';

class BucketController implements Controller {
  public path = '/api/buckets';
  public router = Router();
  private bucketRepo = new BucketRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, try$(this.getBucketByID));
  }

  private getBucketByID = async (req: Request, res: Response) => {
    const { id } = req.params;
    const bkt = await this.bucketRepo.findByID(id);
    if (!bkt) {
      return res.json({ bucket: {} });
    }
    return res.json({ bucket: bkt.toJSON() });
  };
}
export default BucketController;
