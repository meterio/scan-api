import * as fs from 'fs';
import * as path from 'path';

import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Document } from 'mongoose';
import solc from 'solc';

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
import { downloadByVersion } from '../utils/downloader';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';
import { getBytecodeWithoutMetadata, stampDate } from '../utils/verify';

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
    this.router.post(`${this.path}/:address/verify`, try$(this.verifyContract));
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

  private verifyContract = async (req: Request, res: Response) => {
    const { sourceCode, optimizer, version } = req.body;
    // const optimizer = '1';
    // const sourceCode = fs.readFileSync('/tmp/Storage.sol').toString();
    // const version = '0.6.9';
    const { address } = req.params;
    console.log('sourceCode: ', sourceCode);
    console.log('optimizer: ', optimizer);
    console.log('version: ', version);

    const { MODE } = process.env;
    console.log('mode:', MODE);
    const providerUrl =
      MODE === 'mainnet' ? 'http://mainnet.meter.io' : 'http://shoal.meter.io';
    console.log('provider url: ', providerUrl);
    const meterify = require('meterify').meterify;
    const Web3 = require('web3');
    const web3 = meterify(new Web3(), providerUrl);

    let code = '0x';
    try {
      code = await web3.eth.getCode(address);
      if (!code) {
        return res.json({
          result: {
            verified: false,
            error:
              'no code deployed on this address, maybe its not a contract address',
          },
        });
      }
    } catch (e) {
      console.log('could not get code');
      console.log(e);
      return res.json({
        result: {
          verified: false,
          error: 'could not get code due to:' + (e as Error).message,
        },
      });
    }

    try {
      let start = +new Date();
      const input = {
        language: 'Solidity',
        settings: {
          optimizer: { enabled: optimizer === '1', runs: 200 },
          outputSelection: {
            '*': {
              '*': ['*'],
            },
          },
        },
        sources: {
          'test.sol': {
            content: sourceCode,
          },
        },
      };

      console.log(`Load specific version: ${version} starts`);
      const outputPath = await downloadByVersion(version);
      if (!outputPath) {
        console.log('could not download');
      }

      console.log(
        `Download solc-js file takes: ${(+new Date() - start) / 1000} seconds`
      );
      if (!outputPath) {
        return res.json({
          result: { verified: false, error: 'invalid version ' + version },
        });
      }

      start = +new Date();
      console.log('using ', outputPath);
      const solcjs = solc.setupMethods(require(outputPath));
      console.log(
        `load solc-js version takes: ${(+new Date() - start) / 1000} seconds`
      );
      start = +new Date();
      const output = JSON.parse(solcjs.compile(JSON.stringify(input)));
      console.log(output.contracts['test.sol'].Storage);
      console.log(`compile takes ${(+new Date() - start) / 1000} seconds`);

      let check: { error: string; warnings: string[] } = {} as any;
      if (output.errors) {
        check = output.errors.reduce((check, err) => {
          if (err.severity === 'warning') {
            if (!check.warnings) check.warnings = [];
            check.warnings.push(err.message);
          }
          if (err.severity === 'error') {
            check.error = err.message;
          }
          return check;
        }, {});
      }

      let data = {};
      let verified = false;
      let sc;
      console.log('CODE:\n', code);
      if (check.error) {
        data = {
          result: { verified: false, error: check.error },
          err_msg: check.error,
        };
      } else {
        if (output.contracts) {
          let hexBytecode = code.substring(2);
          for (var contractName in output.contracts['test.sol']) {
            console.log('contract: ', contractName);
            const byteCode =
              output.contracts['test.sol'][contractName].evm.bytecode.object;
            const deployedBytecode =
              output.contracts['test.sol'][contractName].evm.deployedBytecode
                .object;
            const processed_compiled_bytecode =
              getBytecodeWithoutMetadata(deployedBytecode);
            // const processed_blockchain_bytecode = helper.getBytecodeWithoutMetadata(hexBytecode.slice(0, curCode.length));
            const constructor_arguments = hexBytecode.slice(byteCode.length);
            // console.log(`contract name:`, contractName)
            // console.log(`processed_blockchain_bytecode: length:${processed_blockchain_bytecode.length}`);
            // console.log(`processed_compiled_bytecode: length:${processed_compiled_bytecode.length}`);
            // console.log(processed_compiled_bytecode.localeCompare(processed_blockchain_bytecode))

            console.log('deployed bytecode: \n', deployedBytecode);
            console.log('byteCode:\n', byteCode);
            console.log('hexBytecode:\n', hexBytecode);
            console.log('constructor arguments:\n', constructor_arguments);
            console.log(
              'Processed_compield_bytecode:\n',
              processed_compiled_bytecode
            );
            console.log(hexBytecode.indexOf(deployedBytecode) > -1);
            console.log(deployedBytecode.length > 0);
            if (
              hexBytecode.indexOf(deployedBytecode) > -1 &&
              deployedBytecode.length > 0
            ) {
              verified = true;
              let abi = output.contracts['test.sol'][contractName].abi;
              const breifVersion = path
                .basename(outputPath)
                .match(/^soljson-(.*).js$/)[1];
              sc = {
                address: address,
                abi: abi,
                source_code: stampDate(sourceCode),
                verification_date: +new Date(),
                compiler_version: breifVersion,
                optimizer: optimizer === '1' ? 'enabled' : 'disabled',
                name: contractName,
                function_hash:
                  output.contracts['test.sol'][contractName].evm
                    .methodIdentifiers,
                constructor_arguments: constructor_arguments,
              };
              break;
            }
          }
        } else {
          return res.json({
            result: { verified: false, error: 'no contracts compiled' },
          });
        }
        data = {
          result: {
            verified,
            error: !verified
              ? 'deployed bytecode doest not match contract compiled bytecode'
              : undefined,
          },
          warning_msg: check.warnings,
          smart_contract: sc,
        };
      }
      console.log(
        `Source code verification result: ${verified}, sending back result`
      );
      res.status(200).json(data);
    } catch (e) {
      console.log('Error: ', e);
      return res.json({
        result: { verified: false, error: (e as Error).message },
      });
    }
  };

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

  private getTxsByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    let start = process.hrtime();
    const { page, limit } = extractPageAndLimitQueryParam(req);
    console.log(`extract cost ${process.hrtime(start)[0]}`);

    start = process.hrtime();
    const txs = await this.txRepo.findByAccount(address, page, limit);
    console.log(`txs cost ${process.hrtime(start)[0]}`);

    start = process.hrtime();
    const count = await this.txRepo.countByAccount(address);
    console.log(`count cost ${process.hrtime(start)[0]}`);

    if (!txs) {
      return res.json({ totalRows: 0, txSummaries: [] });
    }
    return res.json({
      totalRows: count,
      txSummaries: txs.map((tx) => tx.toSummary(address)),
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
      txSummaries: txs.map((tx) => tx.toSummary(address)),
    });
  };

  private getBidsByAccount = async (req: Request, res: Response) => {
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

  private getTokenHoldersByAccount = async (req: Request, res: Response) => {
    const { tokenAddress } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const tokens = await this.tokenBalanceRepo.findByTokenAddress(
      tokenAddress,
      page,
      limit
    );
    console.log('TOKEN ADDRESS: ', tokenAddress);
    const profile = await this.tokenProfileRepo.findByAddress(tokenAddress);
    console.log('PROFILE: ', profile);

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
      .sort((a, b) => (a.balance.isGreaterThan(b.balance) ? -1 : 1));
    return res.json({
      token: !profile ? {} : profile.toJSON(),
      holders: sorted.map((t) => ({
        ...t.toJSON(),
        percentage: t.balance.dividedBy(total),
      })),
    });
  };

  private getTokensByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    console.log(address);
    const tokens = await this.tokenBalanceRepo.findAllByAddress(address);

    if (!tokens) {
      return res.json({ tokens: [] });
    }
    let profileMap = {};
    (
      await this.tokenProfileRepo.findByAddressList(
        tokens
          .filter((t) => t.balance.isGreaterThan(0))
          .map((t) => t.tokenAddress)
      )
    ).forEach((p) => {
      profileMap[p.address] = p;
    });
    return res.json({
      tokens: tokens
        .filter((t) => t.balance.isGreaterThan(0))
        .map((t) => {
          const profile = profileMap[t.tokenAddress];
          let result = t.toJSON();
          if (profile) {
            result.symbol = profile.symbol;
            result.decimals = profile.decimals;
          }
          return result;
        }),
    });
  };

  private getTransfersByAccount = async (req: Request, res: Response) => {
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

  private getERC20TransfersByAccount = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const transfers = await this.transferRepo.findERC20TransferByAccount(
      address,
      page,
      limit
    );
    let tokenAddresses = transfers.map((t) => t.tokenAddress);
    tokenAddresses = tokenAddresses.filter(
      (addr, index) => tokenAddresses.indexOf(addr) === index
    );

    let profileMap = {};
    (await this.tokenProfileRepo.findByAddressList(tokenAddresses)).forEach(
      (p) => {
        profileMap[p.address] = p;
      }
    );

    const count = await this.transferRepo.countERC20TransferByAccount(address);
    if (!transfers) {
      return res.json({ totalRows: 0, transfers: [], tokens: {} });
    }
    let jTransfers = [];
    for (let tr of transfers) {
      const addr = tr.tokenAddress.toLowerCase();
      let jTr = tr.toJSON();
      if (addr in profileMap) {
        jTr.symbol = profileMap[addr].symbol;
        jTr.decimals = profileMap[addr].decimals || 18;
      } else {
        jTr.symbol = 'ERC20';
        jTr.decimals = 18;
      }
      jTransfers.push(jTr);
    }
    return res.json({
      totalRows: count,
      transfers: jTransfers,
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
