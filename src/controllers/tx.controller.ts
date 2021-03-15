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
    console.log('OUTPUTS:', txObj.outputs, 'LEN:', txObj.outputs.length);

    for (
      let clauseIndex = 0;
      clauseIndex < txObj.outputs.length;
      clauseIndex++
    ) {
      const o = txObj.outputs[clauseIndex];
      console.log('OUTPUT:', o);
      for (let logIndex = 0; logIndex < o.events.length; logIndex++) {
        const e = o.events[logIndex];
        console.log('EVENT: ', e);
        events.push({ ...e, clauseIndex, logIndex });
      }
      for (let logIndex = 0; logIndex < o.transfers.length; logIndex++) {
        const t = o.transfers[logIndex];
        console.log('TRANSFER: ', t);
        transfers.push({ ...t, clauseIndex, logIndex });
      }
    }
    console.log('transfers: ', transfers);
    txObj.events = events;
    txObj.transfers = transfers;
    console.log('tx:', txObj);
    return res.json({ summary: tx.toSummary(), tx: txObj });
  };
}

export default TxController;
