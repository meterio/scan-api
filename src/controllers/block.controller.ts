import { Request, Response, Router } from 'express';
import { HttpError, try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import AccountRepo from '../repo/account.repo';
import BlockRepo from '../repo/block.repo';
import TxRepo from '../repo/tx.repo';
import ValidatorRepo from '../repo/validator.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';
import { isHexBytes, isUInt } from '../utils/validator';

class BlockController implements Controller {
  public path = '/api/blocks';
  public router = Router();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private accountRepo = new AccountRepo();
  private validatorRepo = new ValidatorRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, try$(this.getRecentBlocks));
    this.router.get(`${this.path}/:revision`, try$(this.getBlockByRevision));
    this.router.get(`${this.path}/:revision/txs`, try$(this.getBlockTxs));
  }

  private getBlockByRevision = async (req: Request, res: Response) => {
    let blk: any;
    const revision = req.params.revision;
    if (revision === 'best') {
      blk = await this.blockRepo.getBestBlock();
    } else if (revision.startsWith('0x') && isHexBytes(revision, 32)) {
      blk = await this.blockRepo.findByHash(revision);
    } else {
      const num = parseInt(revision);
      if (isNaN(num) || !isUInt(num)) {
        throw new HttpError(
          400,
          'invalid revision: bytes32 or number or best required'
        );
      }
      blk = await this.blockRepo.findByNumber(num);
    }
    if (!blk) {
      return res.json({ block: null, prev: null, next: null });
    }
    let txs = [];
    if (blk.txHashs && blk.txHashs.length > 0) {
      txs = await this.txRepo.findByHashs(blk.txHashs);
    }
    let ans = blk.toSummary();
    ans.txSummaries = txs.map((tx) => tx.toSummary());

    const nameMap = await this.getNameMap();
    ans.beneficiaryName = nameMap[ans.beneficiary] || '';
    delete ans.txHashs;
    return res.json({ block: ans });
  };

  private getBlockTxs = async (req: Request, res: Response) => {
    let blk: any;
    const revision = req.params.revision;
    if (revision === 'best') {
      blk = await this.blockRepo.getBestBlock();
    } else if (revision.startsWith('0x') && isHexBytes(revision, 32)) {
      blk = await this.blockRepo.findByHash(revision);
    } else {
      const num = parseInt(revision);
      if (isNaN(num) || !isUInt(num)) {
        throw new HttpError(
          400,
          'invalid revision: bytes32 or number or best required'
        );
      }
      blk = await this.blockRepo.findByNumber(num);
    }
    if (!blk) {
      return res.json({ txs: [] });
    }

    const txs = await this.txRepo.findByHashs(blk.txHashs);
    return res.json({ txs });
  };

  private getNameMap = async () => {
    let nameMap: { [key: string]: string } = {};
    const knownAccts = await this.accountRepo.findKnownAccounts();
    knownAccts.forEach((a) => {
      nameMap[a.address] = a.name;
    });
    const validators = await this.validatorRepo.findAll();
    validators.forEach((v) => {
      if (v.name) {
        nameMap[v.address] = v.name;
      }
    });
    return nameMap;
  };

  private getRecentBlocks = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const nameMap = await this.getNameMap();
    const count = await this.blockRepo.count();
    if (count <= 0) {
      return res.json({ totalRows: 0, blocks: [] });
    }
    const blocks = await this.blockRepo.findRecent(page, limit);
    res.json({
      totalRows: count,
      blocks: blocks.map((b) => {
        return {
          ...b.toSummary(),
          beneficiaryName: nameMap[b.beneficiary] || '',
        };
      }),
    });
  };
}
export default BlockController;
