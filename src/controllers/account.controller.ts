import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { HttpError, try$ } from 'express-toolbox';

import { LIMIT_WINDOW } from '../const';
import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import BucketRepo from '../repo/bucket.repo';
import TransferRepo from '../repo/transfer.repo';
import TxRepo from '../repo/tx.repo';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

class AccountController implements Controller {
  public path = '/api/accounts';
  public router = Router();
  private accountRepo = new AccountRepo();
  private txRepo = new TxRepo();
  private transferRepo = new TransferRepo();
  private bucketRepo = new BucketRepo();
  private blockRepo = new BlockRepo();

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
    this.router.get(
      `${this.path}/:address/erc20txs`,
      try$(this.getERC20TransfersByAccount)
    );
    this.router.get(
      `${this.path}/:address/buckets`,
      try$(this.getBucketsByAccount)
    );
    this.router.get(
      `${this.path}/:address/proposed`,
      try$(this.getProposedByAccount)
    );
    this.router.get(
      `${this.path}/:address/delegators`,
      try$(this.getDelegatorsByAccount)
    );
  }

  private getAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const account = await this.accountRepo.findByAddress(address);
    if (!account) {
      return res.json({
        account: {
          address,
          mtrBalance: 0,
          mtrBalanceStr: '0 MTR',
          mtrgBalance: 0,
          mtrgBalanceStr: '0 MTRG',
          firstSeen: { number: -1, timestamp: 0 },
          lastUpdate: { number: -1, timestamp: 0 },
        },
      });
    }
    return res.json({
      ...account.toJSON(),
      mtrBalanceStr: fromWei(account.mtrBalance) + ' MTR',
      mtrgBalanceStr: fromWei(account.mtrgBalance) + ' MTRG',
    });
  };

  private getTxsByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const txs = await this.txRepo.findByAccount(address, page, limit);
    const count = await this.txRepo.countByAccount(address);

    if (!txs) {
      return res.json({ totalPage: 0, txSummaries: [] });
    }
    return res.json({
      totalPage: Math.ceil(count / limit),
      txSummaries: txs.map((tx) => tx.toSummary()),
    });
  };

  private getTransfersByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const transfers = await this.transferRepo.findByAccount(
      address,
      page,
      limit
    );
    const count = await this.transferRepo.countByAccount(address);
    if (!transfers) {
      return res.json({ totalPage: 0, transfers: [] });
    }
    return res.json({ totalPage: Math.ceil(count / limit), transfers });
  };

  private getERC20TransfersByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const transfers = await this.transferRepo.findERC20TransferByAccount(
      address,
      page,
      limit
    );
    const count = await this.transferRepo.countERC20TransferByAccount(address);
    if (!transfers) {
      return res.json({ totalPage: 0, transfers: [] });
    }
    return res.json({ totalPage: Math.ceil(count / limit), transfers });
  };

  private getBucketsByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const bkts = await this.bucketRepo.findByAccount(address, page, limit);
    const count = await this.bucketRepo.countByAccount(address);
    if (!bkts) {
      return res.json({ buckets: [] });
    }
    return res.json({
      totalPage: Math.ceil(count / limit),
      buckets: bkts.map((b) => {
        return b.toJSON();
      }),
    });
  };

  private getProposedByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.blockRepo.countBySigner(address);
    const proposed = await this.blockRepo.findBySigner(address, page, limit);

    if (!proposed) {
      return res.json({ totalPage: 0, proposed: [] });
    }
    return res.json({
      totalPage: Math.ceil(count / limit),
      proposed: proposed.map((b) => b.toSummary()),
    });
  };

  private getDelegatorsByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const bkts = await this.bucketRepo.findByAccount(address, page, limit);
    if (!bkts) {
      return res.json({ delegators: [] });
    }
    let dMap: { [key: string]: BigNumber } = {};
    for (const b of bkts) {
      const owner = b.owner.toLowerCase();
      if (owner in dMap) {
        dMap[owner] = b.totalVotes.plus(dMap[owner]);
      } else {
        dMap[owner] = b.totalVotes;
      }
    }
    const delegators = Object.entries(dMap)
      .sort((a, b) => {
        return a[1].isGreaterThan(b[1]) ? 1 : -1;
      })
      .map((item) => {
        return { address: item[0], amount: item[1].toFixed() };
      });

    if (delegators.length >= (page - 1) * limit) {
      return res.json({
        totalPage: Math.ceil(delegators.length / limit),
        delegators: delegators.slice((page - 1) * limit, page * limit),
      });
    } else {
      return res.json({ delegators: [] });
    }
  };
}
export default AccountController;
