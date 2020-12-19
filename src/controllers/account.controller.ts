import { Request, Response, Router } from 'express';
import { HttpError, try$ } from 'express-toolbox';

import { LIMIT_WINDOW } from '../const';
import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import TransferRepo from '../repo/transfer.repo';
import TxRepo from '../repo/tx.repo';
import { isNumString } from '../utils/utils';

class AccountController implements Controller {
  public path = '/api/accounts';
  public router = Router();
  private accountRepo = new AccountRepo();
  private txRepo = new TxRepo();
  private transferRepo = new TransferRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, try$(this.getAccount));
    this.router.get(`${this.path}/:address/txs`, try$(this.getTxsByAccount));
    this.router.get(
      `${this.path}/:address/transfers`,
      try$(this.getTransfersByAccount)
    );
  }

  private getAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const account = await this.accountRepo.findByAddress(address);
    if (!account) {
      return res.json({ account: {} });
    }
    return res.json({ account });
  };

  private getTxsByAccount = async (req, res) => {
    const { address } = req.params;
    let page = 1,
      limit = LIMIT_WINDOW;

    // try get page param
    try {
      const pageParam = Number(req.query.page);
      page = pageParam > 1 ? pageParam : page;
    } catch (e) {
      // ignore
      console.log('Invalid page param: ', req.query.page);
    }

    // try get limit query param
    try {
      const limitParam = Number(req.query.limit);
      limit = limitParam > 0 ? limitParam : limit;
    } catch (e) {
      // ignore
      console.log('Invalid limit param: ', req.query.limit);
    }
    const txs = await this.txRepo.findByAccount(address, page, limit);

    if (!txs) {
      return res.json({ txs: [] });
    }
    return res.json({ txs });
  };

  private getTransfersByAccount = async (req, res) => {
    const { address } = req.params;
    let page = 1,
      limit = LIMIT_WINDOW;

    // try get page param
    try {
      const pageParam = Number(req.query.page);
      page = pageParam > 1 ? pageParam : page;
    } catch (e) {
      // ignore
      console.log('Invalid page param: ', req.query.page);
    }

    // try get limit query param
    try {
      const limitParam = Number(req.query.limit);
      limit = limitParam > 0 ? limitParam : limit;
    } catch (e) {
      // ignore
      console.log('Invalid limit param: ', req.query.limit);
    }

    const transfers = await this.transferRepo.findByAccount(
      address,
      page,
      limit
    );
    if (!transfers) {
      return res.json({ transfers: [] });
    }
    return res.json({ transfers });
  };
}
export default AccountController;
