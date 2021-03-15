import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { RECENT_WINDOW } from '../const';
import Controller from '../interfaces/controller.interface';
import TxRepo from '../repo/tx.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';

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
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.txRepo.count();
    if (count <= 0) {
      return res.json({ totalRows: 0, txs: [] });
    }
    const txs = await this.txRepo.findRecent(page, limit);
    return res.json({
      totalRows: count,
      txs: txs.map((tx) => tx.toSummary()),
    });
  };

  private getTxByHash = async (req, res) => {
    const { hash } = req.params;
    let tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ tx: {}, summary: {} });
    }
    let txObj = tx.toJSON();
    let events = [];
    let transfers = [];
    for (const [clauseIndex, o] of txObj.outputs.entries()) {
      for (const [logIndex, e] of o.events.entries()) {
        events.push({ ...e, clauseIndex, logIndex });
      }
      for (const [logIndex, t] of o.transfers.entries()) {
        transfers.push({ ...t, clauseIndex, logIndex });
      }
    }
    delete txObj.outputs;
    txObj.events = events;
    txObj.transfers = transfers;
    return res.json({ summary: tx.toSummary(), tx: txObj });
  };
}

export default TxController;
