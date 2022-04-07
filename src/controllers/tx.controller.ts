import {
  TxDigestRepo,
  ContractRepo,
  KnownEventRepo,
  KnownMethodRepo,
  TxRepo,
  PosEvent,
  Token,
} from '@meterio/scan-db/dist';
import { sign } from 'crypto';
import e, { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { TransferEvent } from '../const';
import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam } from '../utils/utils';
import { ScriptEngine } from '@meterio/devkit';

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
    this.router.get(`${this.path}/:hash/clauses`, try$(this.getClauses));
    this.router.get(`${this.path}/:hash/transfers`, try$(this.getTransfers));
    this.router.get(`${this.path}/:hash/events`, try$(this.getEvents));
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

  private getEvents = async (req: Request, res: Response) => {
    try {
      const { hash } = req.params;
      let tx = await this.txRepo.findByHash(hash);
      if (!tx) {
        return res.json({ hash, events: [] });
      }

      let events: PosEvent[] = [];
      let topics = [];
      for (const o of tx.outputs) {
        for (const e of o.events) {
          events.push(e);
          if (e.topics && e.topics.length > 0) {
            topics.push(e.topics[0]);
          }
        }
      }

      // build known map
      let knownMap = {}; // signature => knownEvents
      if (topics.length > 0) {
        const knowns = await this.knownEventRepo.findBySignatureList(...topics);
        knowns.forEach((k) => {
          knownMap[k.signature] = k;
        });
      }

      return res.json({
        hash,
        events: events.map((e) => {
          let result = {
            block: tx.block,
            txHash: tx.hash,
            topics: e.topics,
            data: e.data,
            address: e.address,
            overallIndex: e.overallIndex,
          };
          if (e.topics && e.topics.length > 0 && knownMap[e.topics[0]]) {
            const known = knownMap[e.topics[0]];
            return {
              ...result,
              name: known.name,
              abi: JSON.parse(known.abi),
            };
          }
          return result;
        }),
      });
    } catch (e) {
      console.log(e);
    }
  };

  private getTransfers = async (req: Request, res: Response) => {
    const { hash } = req.params;
    let tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ hash, clauses: [] });
    }

    let transfers = [];
    for (const o of tx.outputs) {
      transfers = transfers.concat(o.transfers.map(t => {
        return {
          sender: t.sender,
          recipient: t.recipient,
          amount: t.amount,
          token: Token[t.token],
          overallIndex: t.overallIndex
        }
      }));
    }
    return res.json({ hash, transfers });
  };

  private getClauses = async (req: Request, res: Response) => {
    const { hash } = req.params;
    let tx = await this.txRepo.findByHash(hash);
    if (!tx) {
      return res.json({ hash, clauses: [] });
    }

    let selectors = [];
    let clauses = tx.clauses.map((c) => {
      let signature = '';
      if (c.data && c.data.length > 10) {
        const isSE = ScriptEngine.IsScriptEngineData(c.data);
        if (isSE) {
          const decoded = ScriptEngine.decodeScriptData(c.data);
          signature = decoded.action;
        } else {
          signature = c.data.substring(0, 10);
        }
      }
      if (signature && signature != '0x00000000') {
        selectors.push(signature);
      }
      return {
        to: c.to,
        value: c.value,
        data: c.data,
        token: Token[c.token],
        signature,
      };
    });

    // build known map
    let knownMap = {}; // signature => knownEvents
    if (selectors.length > 0) {
      const knowns = await this.knownMethodRepo.findBySignatureList(...selectors);
      knowns.forEach((k) => {
        knownMap[k.signature] = k;
      });
    }

    return res.json({
      hash,
      clauses: clauses.map((c) => {
        let result = {
          block: tx.block,
          txHash: tx.hash,
          ...c,
        };
        if (c.signature) {
          const known = knownMap[c.signature];
          if (known) {
            return {
              ...result,
              method: known.name,
              abi: JSON.parse(known.abi),
            };
          }
        }
        return result;
      }),
    });
  };
}

export default TxController;
