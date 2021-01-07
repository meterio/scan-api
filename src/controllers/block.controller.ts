import { Request, Response, Router } from 'express';
import { HttpError, try$ } from 'express-toolbox';
import { Document } from 'mongoose';

import { RECENT_WINDOW } from '../const';
import Controller from '../interfaces/controller.interface';
import { Block } from '../model/block.interface';
import BlockRepo from '../repo/block.repo';
import TxRepo from '../repo/tx.repo';
import { isHexBytes, isUInt } from '../utils/validator';

class BlockController implements Controller {
  public path = '/api/blocks';
  public router = Router();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();

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

    delete ans.txHashs;
    return res.json({ block: ans });
  };

  private getBlockTxs = async (req, res) => {
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

  private getRecentBlocks = async (req, res) => {
    let count = RECENT_WINDOW;
    try {
      const countParam = Number(req.query.count);
      count = countParam > 1 ? countParam : count;
    } catch (e) {
      // ignore
      console.log('Invalid count param: ', req.query.count);
    }

    const blocks = await this.blockRepo.findRecent(count);
    if (!blocks) {
      return res.json({ blocks: [] });
    }
    res.json({ blocks: blocks.map((b) => b.toSummary()) });
  };
}
export default BlockController;
