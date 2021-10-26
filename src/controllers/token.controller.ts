import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import TokenProfileRepo from '../repo/tokenProfile.repo';

class TokenController implements Controller {
  public path = '/api/token';
  public router = Router();

  private tokenProfileRepo = new TokenProfileRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, try$(this.getTokenInfo));
  }

  private getTokenInfo = async (req: Request, res: Response) => {
    const { address } = req.params;

    const tokenProfile = await this.tokenProfileRepo.findByAddress(address);

    console.log('token profile: ', tokenProfile);

    res.json({
      result: tokenProfile || {
        name: '',
        symbol: '',
        decimals: 18,
        address: '',
        officialSite: '',
        totalSupply: 0,
        circulation: 0,
        holdersCount: 0,
        transfersCount: 0,
      },
    });
  };
}

export default TokenController;
