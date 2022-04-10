import {
  AccountRepo,
  BidRepo,
  BigNumber,
  BlockRepo,
  BucketRepo,
  ContractRepo,
  MovementRepo,
  TokenBalanceRepo,
  TxDigestRepo,
  TxRepo,
  ContractType,
  ABIFragmentRepo,
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
  private txDigestRepo = new TxDigestRepo();
  private abiFragmentRepo = new ABIFragmentRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/top/mtr`, try$(this.getTopMTRAccounts));
    this.router.get(`${this.path}/top/mtrg`, try$(this.getTopMTRGAccounts));

    this.router.get(`${this.path}/:address`, try$(this.getAccount));

    // token address
    this.router.get(
      `${this.path}/:tokenAddress/holders`,
      try$(this.getTokenHoldersByAccount)
    );
    this.router.get(
      `${this.path}/:address/transfers`,
      try$(this.getTransfersByAccount)
    );

    // user address
    this.router.get(`${this.path}/:address/txs`, try$(this.getTxsByAccount));
    this.router.get(
      `${this.path}/:address/txlist`,
      try$(this.getTxlistByAccount)
    );
    this.router.get(
      `${this.path}/:address/tokens`,
      try$(this.getTokensByAccount)
    );
    this.router.get(
      `${this.path}/:address/erc20txs`,
      try$(this.getERC20TxsByAccount)
    );
    this.router.get(
      `${this.path}/:address/erc721txs`,
      try$(this.getERC721TxsByAccount)
    );
    this.router.get(
      `${this.path}/:address/erc1155txs`,
      try$(this.getERC1155TxsByAccount)
    );
    this.router.get(
      `${this.path}/:address/buckets`,
      try$(this.getBucketsByAccount)
    );
    this.router.get(`${this.path}/:address/bids`, try$(this.getBidsByAccount));
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
    const contract = await this.contractRepo.findByAddress(address);
    if (contract) {
      actJson.type = ContractType[contract.type];
      actJson.tokenName = contract.name;
      actJson.tokenSymbol = contract.symbol;
      actJson.tokenDecimals = contract.decimals;
      actJson.totalSupply = contract.totalSupply.toFixed();
      const holderCount = await this.tokenBalanceRepo.countByTokenAddress(
        address
      );
      const transferCount = await this.movementRepo.countByTokenAddress(
        address
      );
      actJson.holdersCount = holderCount;
      actJson.transfersCount = transferCount;
      actJson.master = contract.master;
      actJson.creationTxHash = contract.creationTxHash;
      actJson.firstSeen = contract.firstSeen;
      actJson.verified = contract.verified;
      actJson.status = contract.status;
    }

    const txCount = await this.txDigestRepo.countByAddress(address);
    const tokenCount = await this.tokenBalanceRepo.countByAddress(address);
    const erc20TxCount = await this.movementRepo.countERC20TxsByAddress(
      address
    );
    const erc721TxCount = await this.movementRepo.countERC721TxsByAddress(
      address
    );
    const bidCount = await this.bidRepo.countByAddress(address);
    const proposedCount = await this.blockRepo.countByBeneficiary(address);
    const bucketCount = await this.bucketRepo.countByAddress(address);

    return res.json({
      account: {
        address,
        ...actJson,
        txCount,
        tokenCount,
        erc20TxCount,
        erc721TxCount,
        bidCount,
        proposedCount,
        bucketCount,
      },
    });
  };

  private getTxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    let start = process.hrtime();
    const { page, limit } = extractPageAndLimitQueryParam(req);

    start = process.hrtime();

    start = process.hrtime();
    const paginate = await this.txDigestRepo.paginateByAccount(
      address,
      page,
      limit
    );

    if (!paginate.result) {
      return res.json({ totalRows: 0, txSummaries: [] });
    }
    const methods = await this.abiFragmentRepo.findAllFunctions();
    let methodMap = {};
    methods.forEach((m) => {
      methodMap[m.signature] = m.name;
    });
    return res.json({
      totalRows: paginate.count,
      txs: paginate.result
        .map((tx) => tx.toJSON())
        .map((tx) => ({ ...tx, method: methodMap[tx.method] || tx.method })),
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
    return res.json({
      txSummaries: txs.map((tx) => tx.toSummary()),
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
    const contract = await this.contractRepo.findByAddress(tokenAddress);
    if (!contract) {
      return res.json({ holders: [], token: {}, isToken: false });
    }

    const paginate = await this.tokenBalanceRepo.paginateByTokenAddress(
      tokenAddress,
      page,
      limit
    );
    if (paginate.count <= 0) {
      return res.json({ holders: [] });
    }
    const bals = paginate.result;

    let total = new BigNumber(0);
    for (const t of bals) {
      if (t.balance.isGreaterThan(0)) {
        total = total.plus(t.balance);
      }
      total = total.plus(t.nftCount);
    }

    // FIXME: handle ERC721 and 1155
    let sorted = bals
      .filter((t) => t.balance.isGreaterThan(0) || t.nftCount.isGreaterThan(0))
      .sort((a, b) =>
        a.balance.isGreaterThan(b.balance)
          ? -1
          : a.nftCount.isGreaterThan(b.nftCount)
          ? -1
          : 1
      );

    return res.json({
      token: !contract ? {} : contract.toJSON(),
      holders: sorted.map((t) => ({
        ...t.toJSON(),
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

    // FIXME: should do the filtering in database instead of here
    return res.json({
      totalRows: paginate.count,
      tokens: paginate.result
        .filter((t) => {
          const balGT0 = new BigNumber(t.balance).isGreaterThan(0);
          let nftCount = new BigNumber(0);
          for (const { value } of t.nftBalances) {
            nftCount = nftCount.plus(value);
          }
          const nftGT0 = nftCount.isGreaterThan(0);

          return balGT0 || nftGT0;
        })
        .map((t) => {
          delete t.__v;
          delete t._id;
          t.tokenType = t.token.type;
          t.tokenName = t.token.name;
          t.tokenSymbol = t.token.symbol;
          t.tokenDecimals = t.token.decimals;
          delete t.token;
          return t;
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
        contract: contract.toJSON(),
        transfers: paginate.result.map((t) => t.toJSON()),
      });
    }
    return res.json({
      totalRows: 0,
      contract: {},
      transfers: [],
    });
  };

  // TODO: API changed, will affect UI
  private getERC20TxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const paginate = await this.movementRepo.paginateERC20TxsByAccount(
      address,
      page,
      limit
    );

    return res.json({
      totalRows: paginate.count,
      txs: paginate.result.map((m) => {
        delete m.__v;
        delete m._id;
        m.name = m.contract.name;
        m.symbol = m.contract.symbol;
        m.decimals = m.contract.decimals;
        m.contractType = m.contract.type;
        delete m.contract;
        return m;
      }),
    });
  };

  private getERC721TxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const paginate = await this.movementRepo.paginateERC721TxsByAccount(
      address,
      page,
      limit
    );

    return res.json({
      totalRows: paginate.count,
      txs: paginate.result.map((m) => {
        delete m.__v;
        delete m._id;
        m.name = m.contract.name;
        m.symbol = m.contract.symbol;
        m.decimals = m.contract.decimals;
        m.contractType = m.contract.type;
        delete m.contract;
        return m;
      }),
    });
  };

  private getERC1155TxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const paginate = await this.movementRepo.paginateERC1155TxsByAccount(
      address,
      page,
      limit
    );

    return res.json({
      totalRows: paginate.count,
      txs: paginate.result.map((m) => {
        delete m.__v;
        delete m._id;
        m.name = m.contract.name;
        m.symbol = m.contract.symbol;
        m.decimals = m.contract.decimals;
        m.contractType = m.contract.type;
        delete m.contract;
        return m;
      }),
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
