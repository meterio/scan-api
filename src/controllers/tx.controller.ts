import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { TransferEvent } from '../const';
import Controller from '../interfaces/controller.interface';
import TokenProfileRepo from '../repo/tokenProfile.repo';
import TxRepo from '../repo/tx.repo';
import KnownEventRepo from '../repo/knownEvent.repo';
import KnownMethodRepo from '../repo/knownMethod.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class TxController implements Controller {
  public path = '/api/txs';
  public router = Router();
  private txRepo = new TxRepo();
  private tokenProfileRepo = new TokenProfileRepo();
  private knownEventRepo = new KnownEventRepo();
  private knownMethodRepo = new KnownMethodRepo();

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
    const methods = await this.knownMethodRepo.findAll();
    return res.json({
      totalRows: count,
      txs: txs.map((tx) => tx.toSummary(undefined, methods)),
    });
  };

  private getTxByHash = async (req: Request, res: Response) => {
    const { hash } = req.params;
    let tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ tx: {}, summary: {} });
    }
    let txObj = tx.toJSON();
    let events = [];
    let clauses = [];
    let transfers = [];
    let tokens = {};

    const knownEvents = await this.knownEventRepo.findAll();
    const knownMethods = await this.knownMethodRepo.findAll();

    for (
      let clauseIndex = 0;
      clauseIndex < txObj.outputs.length;
      clauseIndex++
    ) {
      let knownMethod;
      if (txObj.clauses[clauseIndex].data.length > 10) {
        const methodNameSignature = txObj.clauses[clauseIndex].data.substring(0, 10);
        // const contractAddress = txObj.clauses[clauseIndex].to;
        // knownMethod = knownMethods.find(item => item.signature === methodNameSignature && item.contractAddress === contractAddress);
        knownMethod = knownMethods.find(item => item.signature === methodNameSignature);
        if (!knownMethod) {
          knownMethod = {
            signature: methodNameSignature
          }
        }
      }
      clauses.push({ ...txObj.clauses[clauseIndex], knownMethod })

      const o = txObj.outputs[clauseIndex];
      for (let logIndex = 0; logIndex < o.events.length; logIndex++) {
        const e = o.events[logIndex];
        let knownEvent;
        if (e.topics.length > 0) {
          // knownEvent = knownEvents.find(item => item.signature === e.topics[0] && item.contractAddress === e.address);
          knownEvent = knownEvents.find(item => item.signature === e.topics[0]);
          if (!knownEvent) {
            knownEvent = {
              signature: e.topics[0]
            }
          }
        }
        events.push({ ...e, clauseIndex, logIndex, knownEvent });
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
    let txNewObj = { ...txObj, events, transfers, clauses };
    // txObj.events = events;
    // txObj.transfers = transfers;
    const methods = await this.knownMethodRepo.findAll();
    return res.json({
      summary: tx.toSummary(undefined, methods),
      tx: txNewObj,
      tokens,
    });
  };
}

export default TxController;
