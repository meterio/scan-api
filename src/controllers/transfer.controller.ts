import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { RECENT_WINDOW } from '../const';
import Controller from '../interfaces/controller.interface';
import TransferRepo from '../repo/transfer.repo';

class TransferController implements Controller {
  public path = '/api/transfers';
  public router = Router();
  private transferRepo = new TransferRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, try$(this.getRecent));
  }

  private getRecent = async (req: Request, res: Response) => {
    let count = RECENT_WINDOW;
    try {
      const countParam = Number(req.query.count);
      count = countParam > 1 ? countParam : count;
    } catch (e) {
      // ignore
      console.log('Invalid count param: ', req.query.count);
    }

    const transfers = await this.transferRepo.findRecent(count);
    return res.json({ transfers });
  };
}

export default TransferController;
