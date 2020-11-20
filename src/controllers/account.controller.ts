import { Request, Response, Router } from 'express';
import { try$, HttpError } from 'express-toolbox';
import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import TransferRepo from '../repo/transfer.repo';
import TxRepo from '../repo/tx.repo';

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
    const txs = await this.txRepo.findByAccount(address);
    if (!txs) {
      return res.json({ txs: [] });
    }
    return res.json({ txs });
  };

  private getTransfersByAccount = async (req, res) => {
    const { address } = req.params;
    const transfers = await this.transferRepo.findByAccount(address);
    if (!transfers) {
      return res.json({ transfers: [] });
    }
    return res.json({ transfers });
  };
}
export default AccountController;
