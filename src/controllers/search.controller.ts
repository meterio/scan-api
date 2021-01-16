import { isAddress } from '@meterio/devkit/dist/cry';
import { Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName, enumVals } from '../const';
import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import MetricRepo from '../repo/metric.repo';
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

  private searchByHash = async (req, res) => {
    const { hash } = req.params;

    const block = await this.blockRepo.findByHash(hash);
    const tx = await this.txRepo.findByHash(hash);
    const account = await this.accountRepo.findByAddress(hash);
    if (block) {
      return res.json({ type: 'block', data: block });
    }
    if (tx) {
      return res.json({ type: 'tx', data: tx });
    }
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
