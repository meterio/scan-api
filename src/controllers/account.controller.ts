import {
  AccountRepo,
  BidRepo,
  BigNumber,
  BlockRepo,
  BucketRepo,
  ContractRepo,
  KnownMethodRepo,
  Movement,
  MovementRepo,
  Token,
  TokenBalanceRepo,
  TxRepo,
} from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class AccountController implements Controller {
  public path = '/api/accounts';
  public router = Router();
  private accountRepo = new AccountRepo();
  private txRepo = new TxRepo();
  private movementRepo = new MovementRepo();
  private bucketRepo = new BucketRepo();
  private blockRepo = new BlockRepo();
  private contractRepo = new ContractRepo();
  private tokenBalanceRepo = new TokenBalanceRepo();
  private bidRepo = new BidRepo();
  private knownMethod = new KnownMethodRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/top/mtr`, try$(this.getTopMTRAccounts));
    this.router.get(`${this.path}/top/mtrg`, try$(this.getTopMTRGAccounts));
    this.router.get(`${this.path}/:address`, try$(this.getAccount));
    this.router.get(`${this.path}/:address/txs`, try$(this.getTxsByAccount));
    this.router.get(
      `${this.path}/:address/txlist`,
      try$(this.getTxlistByAccount)
    );
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
      `${this.path}/:address/erc721txs`,
      try$(this.getERC721TransfersByAccount)
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

    const paginate = await this.accountRepo.paginateTopMTRAccounts(page, limit);
    return res.json({
      totalRows: paginate.count,
      accounts: paginate.result.map(this.convertAccount),
    });
  };

  private getTopMTRGAccounts = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.accountRepo.paginateTopMTRGAccounts(
      page,
      limit
    );
    return res.json({
      totalRows: paginate.count,
      accounts: paginate.result.map(this.convertAccount),
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
    const contract = await this.contractRepo.findByAddress(address);
    actJson.isContract = true;
    if (contract) {
      actJson.type = contract.type;
      actJson.tokenName = contract.name;
      actJson.tokenSymbol = contract.symbol;
      actJson.tokenDecimals = contract.decimals;
      actJson.totalSupply = contract.totalSupply.toFixed();
      actJson.holdersCount = contract.holdersCount.toFixed();
    } else {
      actJson.type = 0;
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

  private getTxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    let start = process.hrtime();
    const { page, limit } = extractPageAndLimitQueryParam(req);

    start = process.hrtime();

    start = process.hrtime();
    const paginate = await this.txRepo.paginateByAccount(address, page, limit);

    if (!paginate.result) {
      return res.json({ totalRows: 0, txSummaries: [] });
    }
    const methods = await this.knownMethod.findAll();
    return res.json({
      totalRows: paginate.count,
      txSummaries: paginate.result.map((tx) => tx.toSummary(address, methods)),
    });
  };

  private getTxlistByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    let { startblock, endblock, sort } = req.query;

    let start = Number(startblock);
    let end = 0;
    if (endblock === 'latest') {
      end = Infinity;
    } else {
      end = Number(endblock);
    }

    if (isNaN(start)) {
      start = 0;
    }

    if (isNaN(end)) {
      end = Infinity;
    }

    const txs = await this.txRepo.findByAccountInRange(
      address,
      start,
      end,
      sort.toString()
    );

    if (!txs) {
      return res.json({ totalRows: 0, txSummaries: [] });
    }
    const methods = await this.knownMethod.findAll();
    return res.json({
      txSummaries: txs.map((tx) => tx.toSummary(address, methods)),
    });
  };

  private getBidsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.bidRepo.paginateByAddress(address, page, limit);
    const bids = paginate.result;

    if (!bids) {
      return res.json({ totalRows: 0, bids: [] });
    }
    return res.json({
      totalRows: paginate.count,
      bids: bids.map((b) => b.toSummary()),
    });
  };

  // FIXME: could be wrong for ERC721/1155 for percentage
  private getTokenHoldersByAccount = async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.tokenBalanceRepo.paginateByTokenAddress(
      tokenAddress,
      page,
      limit
    );
    console.log('TOKEN ADDRESS: ', tokenAddress);
    const contract = await this.contractRepo.findByAddress(tokenAddress);

    if (paginate.count <= 0) {
      return res.json({ holders: [] });
    }
    const tokens = paginate.result;

    let total = new BigNumber(0);
    for (const t of tokens) {
      if (t.balance.isGreaterThan(0)) {
        total = total.plus(t.balance);
      }
    }
    // FIXME: handle ERC721 and 1155
    let sorted = tokens
      .filter((t) => t.balance.isGreaterThan(0))
      .sort((a, b) => (a.balance.isGreaterThan(b.balance) ? -1 : 1));
    return res.json({
      token: !contract ? {} : contract.toJSON(),
      holders: sorted.map((t) => ({
        ...t.toJSON(),
        percentage: t.balance.dividedBy(total),
      })),
      totalRows: paginate.count,
    });
  };

  private getTokensByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    console.log(address);
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.tokenBalanceRepo.paginateByAddress(
      address,
      page,
      limit
    );

    if (paginate.count <= 0) {
      return res.json({ totalRows: 0, tokens: [] });
    }
    // FIXME: optimize
    const tokenAddresses = paginate.result
      .filter((t) => t.balance.isGreaterThan(0))
      .map((t) => t.tokenAddress);
    let contractMap = {};
    (await this.contractRepo.findByAddressList(tokenAddresses)).forEach((p) => {
      contractMap[p.address] = p;
    });

    return res.json({
      totalRows: paginate.count,
      tokens: paginate.result
        .filter((t) => t.balance.isGreaterThan(0))
        .map((t) => {
          return {
            ...t.toJSON(),
            token: contractMap[t.tokenAddress],
          };
        }),
    });
  };

  // TODO: changed API, will affect UI
  private getTransfersByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const contract = await this.contractRepo.findByAddress(address);

    if (contract) {
      const paginate = await this.movementRepo.paginateByTokenAddress(
        address,
        page,
        limit
      );
      return res.json({
        totalRows: paginate.count,
        transfers: paginate.result.map((t) => ({
          ...t.toJSON(),
          token: contract.toJSON(),
        })),
      });
    } else {
      const paginate = await this.movementRepo.paginateByAccount(
        address,
        page,
        limit
      );
      const tokenAddresses = paginate.result.map((tr) => tr.tokenAddress);
      let contractMap = {};
      (await this.contractRepo.findByAddressList(tokenAddresses)).map((c) => {
        contractMap[c.address] = c.toJSON();
      });

      return res.json({
        totalRows: paginate.count,
        transfers: paginate.result.map((t) => ({
          ...t.toJSON(),
          token: contractMap[t.tokenAddress],
        })),
      });
    }
  };

  // TODO: API changed, will affect UI
  private getERC20TransfersByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const paginate = await this.movementRepo.paginateERC20TransferByAccount(
      address,
      page,
      limit
    );
    const transfers = paginate.result;
    const tokenAddresses = transfers.map((t) => t.tokenAddress);

    let contractMap = {};
    (await this.contractRepo.findByAddressList(tokenAddresses)).forEach((p) => {
      contractMap[p.address] = p.toJSON();
    });

    let jTransfers = [];
    // for (let tr of transfers) {
    //   const addr = tr.tokenAddress.toLowerCase();
    //   let jTr = tr.toJSON();
    //   if (addr in profileMap) {
    //     jTr.symbol = profileMap[addr].symbol;
    //     jTr.decimals = profileMap[addr].decimals || 18;
    //   } else {
    //     jTr.symbol = 'ERC20';
    //     jTr.decimals = 18;
    //   }
    //   jTransfers.push(jTr);
    // }
    return res.json({
      totalRows: paginate.count,
      transfers: paginate.result.map((t) => ({
        ...t.toJSON(),
        token: contractMap[t.tokenAddress],
      })),
    });
  };

  private getERC721TransfersByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const paginate = await this.movementRepo.paginateERC721TransferByAccount(
      address,
      page,
      limit
    );
    const transfers = paginate.result;
    const tokenAddresses = transfers.map((t) => t.tokenAddress);

    let contractMap = {};
    (await this.contractRepo.findByAddressList(tokenAddresses)).forEach((p) => {
      contractMap[p.address] = p.toJSON();
    });

    return res.json({
      totalRows: paginate.count,
      transfers: paginate.result.map((t) => ({
        ...t.toJSON(),
        token: contractMap[t.tokenAddress],
      })),
    });
  };

  private getBucketsByAccount = async (req: Request, res: Response) => {
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

  private getProposedByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.blockRepo.paginateByBeneficiary(
      address,
      page,
      limit
    );

    return res.json({
      totalRows: paginate.count,
      proposed: paginate.result.map((b) => b.toSummary()),
    });
  };

  private getDelegatorsByAccount = async (req: Request, res: Response) => {
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
