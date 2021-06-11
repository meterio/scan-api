import { isAddress } from '@meterio/devkit/dist/cry';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import TxRepo from '../repo/tx.repo';

class SearchController implements Controller {
  public path = '/api/search';
  public router = Router();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private accountRepo = new AccountRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:hash`, try$(this.searchByHash));
  }

  private searchByHash = async (req: Request, res: Response) => {
    const { hash } = req.params;

    let number = -1;
    try {
      number = Number(hash);
      const block = await this.blockRepo.findByNumber(number);
      if (block) {
        return res.json({ type: 'block', data: block });
      }
    } catch (e) {
      console.log('could not find by number');
    }
    const block = await this.blockRepo.findByHash(hash);
    if (block) {
      return res.json({ type: 'block', data: block });
    }

    const tx = await this.txRepo.findByHash(hash);
    if (tx) {
      return res.json({ type: 'tx', data: tx });
    }

    const account = await this.accountRepo.findByAddress(hash);
    if (account) {
      return res.json({ type: 'address', data: account });
    }

    if (isAddress(hash)) {
      return res.json({ type: 'address', data: { address: hash } });
    }
    return res.json({ type: 'unknown', data: {} });
  };
}

export default SearchController;
