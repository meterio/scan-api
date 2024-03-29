import { BigNumber, ContractRepo, MovementRepo } from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

class TokenController implements Controller {
  public path = '/api/token';
  public router = Router();

  private contractRepo = new ContractRepo();
  private movementRepo = new MovementRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, try$(this.getTokenInfo));
  }

  private getTokenInfo = async (req: Request, res: Response) => {
    const { address } = req.params;

    const contract = await this.contractRepo.findByAddress(address);
    const transfersCount = await this.movementRepo.countByTokenAddress(address);
    console.log('transfersCount: ', transfersCount);

    res.json({
      result: contract.toJSON() || {
        name: '',
        symbol: '',
        decimals: 18,
        address: '',
        officialSite: '',
        totalSupply: 0,
        circulation: 0,
        holdersCount: 0,
        transfersCount,
      },
    });
  };
}

export default TokenController;
