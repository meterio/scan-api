import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { TransferEvent } from '../const';
import Controller from '../interfaces/controller.interface';
import TokenProfileRepo from '../repo/tokenProfile.repo';
import TxRepo from '../repo/tx.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class TxController implements Controller {
  public path = '/api/txs';
  public router = Router();
  private txRepo = new TxRepo();
  private tokenProfileRepo = new TokenProfileRepo();

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
    let tokens = {};

    for (
      let clauseIndex = 0;
      clauseIndex < txObj.outputs.length;
      clauseIndex++
    ) {
      const o = txObj.outputs[clauseIndex];
      for (let logIndex = 0; logIndex < o.events.length; logIndex++) {
        const e = o.events[logIndex];
        events.push({ ...e, clauseIndex, logIndex });
        if (e.topics && e.topics[0] === TransferEvent.signature) {
          const token = await this.tokenProfileRepo.findByAddress(e.address);
          if (token) {
            tokens[token.address.toLowerCase()] = token.toJSON();
          }
        }
      }
      for (let logIndex = 0; logIndex < o.transfers.length; logIndex++) {
        const t = o.transfers[logIndex];
        transfers.push({ ...t, clauseIndex, logIndex });
      }
    }
    txObj.events = events;
    txObj.transfers = transfers;
    return res.json({ summary: tx.toSummary(), tx: txObj, tokens });
  };
}

export default TxController;
