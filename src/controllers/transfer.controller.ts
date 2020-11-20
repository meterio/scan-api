import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

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
    const transfers = await this.transferRepo.findRecent();
    return res.json({ transfers });
  };
}

export default TransferController;
