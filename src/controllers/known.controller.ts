import {
  KnownEventRepo,
  KnownMethodRepo,
  KnownRepo,
  TokenProfileRepo,
} from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import {
  AccountLockModuleAddress,
  AuctionAccountAddress,
  AuctionLeftOverAddress,
  AuctionModuleAddress,
  BridgePoolAddress,
  ExecutorAddress,
  ParamsAddress,
  StakingModuleAddress,
  ValidatorBenefitAddress,
} from '../const';
import Controller from '../interfaces/controller.interface';

class KnownController implements Controller {
  public path = '/api/knowns';
  public router = Router();
  private knownRepo = new KnownRepo();
  private tokenProfileRepo = new TokenProfileRepo();
  private knownEventRepo = new KnownEventRepo();
  private knownMethodRepo = new KnownMethodRepo();
  private knownMap = {};

  constructor() {
    this.initializeRoutes();
    this.knownMap[AuctionAccountAddress] = 'Auction Account';
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/address`, try$(this.getKnownAddresses));
    this.router.get(`${this.path}/token`, try$(this.getKnownTokens));
    this.router.post(
      `${this.path}/saveMethodAndEvent`,
      try$(this.saveMethodAndEvent)
    );
    this.router.get(
      `${this.path}/getAllMethodAndEvent`,
      try$(this.getAllMethodAndEvent)
    );
  }

  private getAllMethodAndEvent = async (req: Request, res: Response) => {
    try {
      const events = await this.knownEventRepo.findAll();
      const methods = await this.knownMethodRepo.findAll();

      res.json({
        status: true,
        events,
        methods,
      });
    } catch (e) {
      return res.json({
        status: false,
        message: e.message,
      });
    }
  };

  private saveMethodAndEvent = async (req: Request, res: Response) => {
    const { events, methods } = req.body;
    const err = [];
    try {
      if (events.length > 0) {
        await this.knownEventRepo.bulkInsert(events);
      }
    } catch (e) {
      err.push(e.message);
    }
    try {
      if (methods.length > 0) {
        await this.knownMethodRepo.bulkInsert(methods);
      }
    } catch (e) {
      err.push(e.message);
    }
    if (err.length > 0) {
      return res.json({
        status: false,
        message: err.join(','),
      });
    }
    res.json({
      status: true,
    });
  };

  private getKnownAddresses = async (req: Request, res: Response) => {
    const knowns = await this.knownRepo.findAll();
    let addresses = {};
    addresses[AccountLockModuleAddress] = 'Account Lock Engine';
    addresses[AuctionAccountAddress] = 'Auction Account';
    addresses[AuctionLeftOverAddress] = 'Auction Leftover';
    addresses[AuctionModuleAddress] = 'Auction Engine';
    addresses[BridgePoolAddress] = 'Bridge Pool';
    addresses[ExecutorAddress] = 'Executor';
    addresses[ParamsAddress] = 'Params';
    addresses[StakingModuleAddress] = 'Staking Engine';
    addresses[ValidatorBenefitAddress] = 'Staking Reward';

    if (!knowns) {
      return res.json({ addresses });
    }
    for (const k of knowns) {
      addresses[k.address.toLowerCase()] = k.name;
    }
    return res.json({ addresses });
  };

  private getKnownTokens = async (req: Request, res: Response) => {
    const tokens = await this.tokenProfileRepo.findAll();
    if (!tokens) {
      return res.json({ tokens: [] });
    }
    return res.json({
      tokens: tokens.map((t) => ({
        address: t.address,
        symbol: t.symbol,
        decimals: t.decimals,
      })),
    });
  };
}
export default KnownController;
