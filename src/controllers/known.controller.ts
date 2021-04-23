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
import KnownRepo from '../repo/known.repo';
import TokenProfileRepo from '../repo/tokenProfile.repo';

class KnownController implements Controller {
  public path = '/api/knowns';
  public router = Router();
  private knownRepo = new KnownRepo();
  private tokenProfileRepo = new TokenProfileRepo();
  private knownMap = {};

  constructor() {
    this.initializeRoutes();
    this.knownMap[AuctionAccountAddress] = 'Auction Account';
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/address`, try$(this.getKnownAddresses));
    this.router.get(`${this.path}/token`, try$(this.getKnownTokens));
  }

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
