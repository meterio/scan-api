import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { ENERGY_SYM, ZeroAddress } from '../const';
import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

import {
  BlockRepo,
  CommitteeRepo,
  PowBlockRepo,
  TxRepo,
  BigNumber
} from '@meterio/scan-db';

class PowController implements Controller {
  public path = '/api/pow';
  public router = Router();
  private powBlockRepo = new PowBlockRepo();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private committeeRepo = new CommitteeRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/rewards`, try$(this.getPowRewards));
    this.router.get(
      `${this.path}/rewards/:epoch`,
      try$(this.getPowRewardsByEpoch)
    );
    this.router.get(
      `${this.path}/blocks/recent`,
      try$(this.getRecentPowBlocks)
    );
  }

  private getPowRewards = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const committees = await this.committeeRepo.findAll(page, limit);
    const numbers = committees.map((c) => c.kblockHeight);
    let kblocks = await this.blockRepo.findByNumberList(numbers);
    kblocks = kblocks.sort((a, b) => (a.number > b.number ? -1 : 1));
    const count = await this.blockRepo.countKBlocks();
    if (!kblocks) {
      return res.json({ totalRows: 0, rewards: [] });
    }
    let rewards = [];
    for (const kb of kblocks) {
      const coinbaseTxHash = kb.txHashs[0];
      const coinbaseTx = await this.txRepo.findByHash(coinbaseTxHash);
      let total = new BigNumber(0);
      let rewardMap: { [key: string]: BigNumber } = {};
      let details = [];
      if (!!coinbaseTx && coinbaseTx.origin === ZeroAddress) {
        for (const c of coinbaseTx.clauses) {
          total = total.plus(c.value);
          if (c.to in rewardMap) {
            rewardMap[c.to] = rewardMap[c.to].plus(c.value);
          } else {
            rewardMap[c.to] = new BigNumber(c.value);
          }
        }
        for (const addr in rewardMap) {
          details.push({
            address: addr,
            subTotal: rewardMap[addr].toFixed(),
            subTotalStr: `${fromWei(rewardMap[addr])} ${ENERGY_SYM}`,
          });
        }
        let powStart = 0;
        let powEnd = 0;
        if (kb.powBlocks) {
          for (const pb of kb.powBlocks) {
            if (powStart == 0) {
              powStart = pb.height;
            } else {
              powStart = powStart > pb.height ? pb.height : powStart;
            }
            powEnd = powEnd < pb.height ? pb.height : powEnd;
          }
        }
        rewards.push({
          posBlock: kb.number,
          powStart,
          powEnd,
          powBlock: 1274, // FIXME: fake number
          timestamp: kb.timestamp,
          epoch: kb.epoch,
          totalAmount: total.toFixed(),
          totalAmountStr: `${fromWei(total)} ${ENERGY_SYM}`,
          details,
        });
      }
    }
    return res.json({ totalRows: count, rewards });
  };

  private getPowRewardsByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const kblocks = await this.blockRepo.findKBlocksByEpochs([parseInt(epoch)]);
    if (kblocks.length <= 0) {
      return res.json({
        posBlock: 0,
        powBlock: 0,
        timestamp: 0,
        epoch: epoch,
        totalAmount: 0,
        totalAmountStr: `0 ${ENERGY_SYM}`,
        details: [],
      });
    }

    const kb = kblocks[0];
    const coinbaseTxHash = kb.txHashs[0];
    const coinbaseTx = await this.txRepo.findByHash(coinbaseTxHash);
    let total = new BigNumber(0);
    let rewardMap: { [key: string]: BigNumber } = {};
    let details = [];
    if (!!coinbaseTx && coinbaseTx.origin === ZeroAddress) {
      for (const c of coinbaseTx.clauses) {
        total = total.plus(c.value);
        if (c.to in rewardMap) {
          rewardMap[c.to] = rewardMap[c.to].plus(c.value);
        } else {
          rewardMap[c.to] = new BigNumber(c.value);
        }
      }
      for (const addr in rewardMap) {
        details.push({
          address: addr,
          subTotal: rewardMap[addr].toFixed(),
          subTotalStr: `${fromWei(rewardMap[addr])} ${ENERGY_SYM}`,
        });
      }
      return res.json({
        posBlock: kb.number,
        powBlock: 1274, // FIXME: fake number
        timestamp: kb.timestamp,
        epoch: kb.epoch,
        totalAmount: total.toFixed(),
        totalAmountStr: `${fromWei(total)} ${ENERGY_SYM}`,
        details,
      });
    }
  };

  private getRecentPowBlocks = async (req: Request, res: Response) => {
    const blocks = await this.powBlockRepo.findRecent();
    if (!blocks) {
      return res.json({ powBlocks: [] });
    }
    return res.json({ powBlocks: blocks });
  };
}

export default PowController;
