import { Request, Response, Router } from 'express';
import { try$, HttpError } from 'express-toolbox';
import { Block } from '../model/block.interface';
import Controller from '../interfaces/controller.interface';
import BlockRepo from '../repo/block.repo';
import { isHexBytes, isUInt } from '../utils/validator';
import { Document } from 'mongoose';
import TxRepo from '../repo/tx.repo';

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
    return res.json({ block: blk.toJSON() });
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
    const blocks = await this.blockRepo.findRecent();
    res.json({ blocks });
  };
}
export default BlockController;
