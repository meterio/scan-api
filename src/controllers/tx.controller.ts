import {
  TxDigestRepo,
  ContractRepo,
  KnownEventRepo,
  KnownMethodRepo,
  TxRepo,
} from '@meterio/scan-db/dist';
import e, { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { TransferEvent } from '../const';
import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class TxController implements Controller {
  public path = '/api/txs';
  public router = Router();
  private txRepo = new TxRepo();
  private txDigestRepo = new TxDigestRepo();
  private contractRepo = new ContractRepo();
  private knownEventRepo = new KnownEventRepo();
  private knownMethodRepo = new KnownMethodRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, this.getRecent);
    this.router.get(`${this.path}/:hash`, try$(this.getTxByHash));
  }

  private getRecent = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.txDigestRepo.paginateAll(page, limit);
    const methods = await this.knownMethodRepo.findAll();
    let methodMap = {};
    methods.forEach((m) => (methodMap[m.signature] = m.name));
    return res.json({
      totalRows: paginate.count,
      txs: paginate.result
        .map((tx) => tx.toJSON())
        .map((tx) => ({
          ...tx,
          method: tx.method in methodMap ? methodMap[tx.method] : tx.method,
        })),
    });
  };

  private getTxByHash = async (req: Request, res: Response) => {
    const { hash } = req.params;
    let tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ tx: {}, summary: {} });
    }
    let txObj = tx.toJSON();

    let transfers = [];
    let tokens = {};
    let events = [];

    const knownEvents = await this.knownEventRepo.findAll();
    const knownMethods = await this.knownMethodRepo.findAll();
    let methodMap = {};
    knownMethods.forEach((m) => {
      methodMap[m.signature] = m.name;
    });
    let eventMap = {};
    knownEvents.forEach((e) => {
      eventMap[e.signature] = e.name;
    });

    const clauses = txObj.clauses.map((c) => {
      let sig = c.data.substring(0, 10);
      const method = methodMap[sig] || sig;
      return { ...c, method };
    });
    for (const [clauseIndex, o] of txObj.outputs.entries()) {
      for (const [logIndex, e] of o.events.entries()) {
        if (e.topics && e.topics.length >= 1) {
          events.push({
            ...e,
            clauseIndex,
            logIndex,
            event: eventMap[e.topics[0]] || '',
          });
          if (e.topics && e.topics[0] === TransferEvent.signature) {
            const token = await this.contractRepo.findByAddress(e.address);
            if (token) {
              tokens[token.address.toLowerCase()] = token.toJSON();
            }
          }
        }
      }
      for (const [logIndex, t] of o.transfers.entries()) {
        transfers.push({ ...t, clauseIndex, logIndex });
      }
    }

    let txNewObj = { ...txObj, events, transfers, clauses };
    // txObj.events = events;
    // txObj.transfers = transfers;

    return res.json({
      summary: {
        ...tx.toJSON(),
      },
      tx: txNewObj,
      tokens,
    });
  };
}

export default TxController;
