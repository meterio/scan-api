import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BidRepo from '../repo/bid.repo';
import BlockRepo from '../repo/block.repo';
import BucketRepo from '../repo/bucket.repo';
import TokenBalanceRepo from '../repo/tokenBalance.repo';
import TokenProfileRepo from '../repo/tokenProfile.repo';
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
  private tokenProfileRepo = new TokenProfileRepo();
  private tokenBalanceRepo = new TokenBalanceRepo();
  private bidRepo = new BidRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/top/mtr`, try$(this.getTopMTRAccounts));
    this.router.get(`${this.path}/top/mtrg`, try$(this.getTopMTRGAccounts));
    this.router.get(`${this.path}/:address`, try$(this.getAccount));
    this.router.get(`${this.path}/:address/txs`, try$(this.getTxsByAccount));
    this.router.get(`${this.path}/:address/bids`, try$(this.getBidsByAccount));
    this.router.get(
      `${this.path}/:address/tokens`,
      try$(this.getTokensByAccount)
    );
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
  private getTopMTRAccounts = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.accountRepo.count();

    if (count <= 0) {
      return res.json({ totalRows: 0, accounts: [] });
    }
    const accounts = await this.accountRepo.findTopMTRAccounts(page, limit);
    return res.json({
      totalRows: count,
      accounts: accounts.map(this.convertAccount),
    });
  };

  private getTopMTRGAccounts = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.accountRepo.count();

    if (count <= 0) {
      return res.json({ totalRows: 0, accounts: [] });
    }
    const accounts = await this.accountRepo.findTopMTRGAccounts(page, limit);
    return res.json({
      totalRows: count,
      accounts: accounts.map(this.convertAccount),
    });
  };

  private convertAccount = (account: any) => {
    if (!account) {
      return {
        mtrBalance: 0,
        mtrBounded: 0,
        mtrgBalance: 0,
        mtrgBounded: 0,
        firstSeen: { number: -1, timestamp: 0 },
        lastUpdate: { number: -1, timestamp: 0 },
      };
    }
    return {
      ...account.toJSON(),
    };
  };

  private getAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const account = await this.accountRepo.findByAddress(address);
    const actJson = this.convertAccount(account);
    if (account.code) {
      const tokenProfile = await this.tokenProfileRepo.findByAddress(address);
      if (tokenProfile) {
        actJson.isERC20 = true;
        actJson.tokenName = tokenProfile.name;
        actJson.tokenSymbol = tokenProfile.symbol;
        actJson.tokenDecimals = tokenProfile.decimals;
      }
    }
    return res.json({
      account: {
        address,
        ...actJson,
      },
    });
  };

  private getTxsByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const txs = await this.txRepo.findByAccount(address, page, limit);
    const count = await this.txRepo.countByAccount(address);

    if (!txs) {
      return res.json({ totalRows: 0, txSummaries: [] });
    }
    return res.json({
      totalRows: count,
      txSummaries: txs.map((tx) => tx.toSummary()),
    });
  };

  private getBidsByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const bids = await this.bidRepo.findByAddress(address, page, limit);
    const count = await this.bidRepo.countByAddress(address);

    if (!bids) {
      return res.json({ totalRows: 0, bids: [] });
    }
    return res.json({
      totalRows: count,
      bids: bids.map((b) => b.toSummary()),
    });
  };

  private getTokensByAccount = async (req, res) => {
    const { address } = req.params;
    const tokens = await this.tokenBalanceRepo.findAllByAddress(address);

    if (!tokens) {
      return res.json({ tokens: [] });
    }
    return res.json({ tokens: tokens.map((t) => t.toSummary()) });
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
      return res.json({ totalRows: 0, transfers: [] });
    }
    return res.json({ totalRows: count, transfers });
  };

  private getERC20TransfersByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const transfers = await this.transferRepo.findERC20TransferByAccount(
      address,
      page,
      limit
    );
    const profiles = await this.tokenProfileRepo.findAll();
    let tokens = {};
    for (const p of profiles) {
      tokens[p.address] = p;
    }

    const count = await this.transferRepo.countERC20TransferByAccount(address);
    if (!transfers) {
      return res.json({ totalRows: 0, transfers: [], tokens: {} });
    }
    let jTransfers = [];
    for (let tr of transfers) {
      const addr = tr.tokenAddress.toLowerCase();
      let jTr = tr.toJSON();
      if (addr in tokens) {
        jTr.symbol = tokens[addr].symbol.toUpperCase();
      } else {
        jTr.symbol = '';
      }
      jTransfers.push(jTr);
    }
    return res.json({
      totalRows: count,
      transfers: jTransfers,
    });
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
      totalRows: count,
      buckets: bkts.map((b) => {
        return b.toJSON();
      }),
    });
  };

  private getProposedByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.blockRepo.countByBeneficiary(address);
    const proposed = await this.blockRepo.findByBeneficiary(
      address,
      page,
      limit
    );

    if (!proposed) {
      return res.json({ totalRows: 0, proposed: [] });
    }
    return res.json({
      totalRows: count,
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
        totalRows: delegators.length,
        delegators: delegators.slice((page - 1) * limit, page * limit),
      });
    } else {
      return res.json({ delegators: [] });
    }
  };
}
export default AccountController;
