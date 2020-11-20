import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import TxRepo from '../repo/tx.repo';

class TxController implements Controller {
  public path = '/api/txs';
  public router = Router();
  private txRepo = new TxRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, try$(this.getRecent));
    this.router.get(`${this.path}/:hash`, try$(this.getTxByHash));
  }

  private getRecent = async (req: Request, res: Response) => {
    const txs = await this.txRepo.findRecent();
    return res.json({ txs });
  };

  private getTxByHash = async (req, res) => {
    const { hash } = req.params;
    const tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ tx: {} });
    }
    return res.json({ tx });
  };
}

export default TxController;
