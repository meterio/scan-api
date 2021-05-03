import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Document } from 'mongoose';

import { Token } from '../const';
import Controller from '../interfaces/controller.interface';
import { Transfer } from '../model/transfer.interface';
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
      `${this.path}/:tokenAddress/holders`,
      try$(this.getTokenHoldersByAccount)
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
    if (!account) {
      return res.json({
        account: { address, mtr: 0, mtrg: 0, mtrBounded: 0, mtrgBounded: 0 },
      });
    }
    if (account.code) {
      const tokenProfile = await this.tokenProfileRepo.findByAddress(address);
      actJson.isContract = true;
      if (tokenProfile) {
        actJson.isERC20 = true;
        actJson.tokenName = tokenProfile.name;
        actJson.tokenSymbol = tokenProfile.symbol;
        actJson.tokenDecimals = tokenProfile.decimals;
        actJson.circulation = tokenProfile.circulation.toFixed();
        actJson.holdersCount = tokenProfile.holdersCount.toFixed();
      }
    } else {
      actJson.isContract = false;
      actJson.isERC20 = false;
    }
    delete actJson['code'];
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

  private getTokenHoldersByAccount = async (req, res) => {
    const { tokenAddress } = req.params;
    const tokens = await this.tokenBalanceRepo.findAllByTokenAddress(
      tokenAddress
    );

    if (!tokens) {
      return res.json({ holders: [] });
    }
    let total = new BigNumber(0);
    for (const t of tokens) {
      if (t.balance.isGreaterThan(0)) {
        total = total.plus(t.balance);
      }
    }
    let sorted = tokens
      .filter((t) => t.balance.isGreaterThan(0))
      .sort((a, b) => (a.balance.isGreaterThan(b.balance) ? 1 : -1));
    return res.json({
      holders: sorted.map((t) => ({
        ...t.toJSON(),
        percentage: t.balance.dividedBy(total),
      })),
    });
  };

  private getTokensByAccount = async (req, res) => {
    const { address } = req.params;
    console.log(address);
    const tokens = await this.tokenBalanceRepo.findAllByAddress(address);

    console.log(tokens);
    if (!tokens) {
      console.log('TOKEN IS EMPTY');
      return res.json({ tokens: [] });
    }
    return res.json({ tokens: tokens.map((t) => t.toJSON()) });
  };

  private getTransfersByAccount = async (req, res) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const account = await this.accountRepo.findByAddress(address);

    const isContract = !!account && !!account.code;
    let transfers: (Transfer & Document)[] = [];
    let count = 0;
    if (!isContract) {
      transfers = await this.transferRepo.findByAccount(address, page, limit);
      count = await this.transferRepo.countByAccount(address);
    } else {
      transfers = await this.transferRepo.findByTokenAddress(
        address,
        page,
        limit
      );
      count = await this.transferRepo.countByTokenAddress(address);
    }
    if (!transfers) {
      return res.json({ totalRows: 0, transfers: [] });
    }
    let tokenAddresses = transfers.map((tr) => tr.tokenAddress);
    tokenAddresses = tokenAddresses.filter(
      (v, index) => tokenAddresses.indexOf(v) === index
    );
    const profiles = await this.tokenProfileRepo.findByAddressList(
      tokenAddresses
    );
    let tokens = {};
    for (const p of profiles) {
      tokens[p.address] = p;
    }
    return res.json({
      totalRows: count,
      transfers: transfers.map((tr) => {
        let erc20 = {
          symbol: '',
        };
        if (tr.token === Token.ERC20) {
          erc20 = tokens[tr.tokenAddress.toLowerCase()];
        }

        return {
          ...tr.toJSON(),
          token: erc20 && erc20.symbol ? erc20.symbol : Token[tr.token],
          erc20,
        };
      }),
    });
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
