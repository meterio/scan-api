import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import BlockRepo from '../repo/block.repo';
import CommitteeRepo from '../repo/committee.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class EpochController implements Controller {
  public path = '/api/epochs';
  public router = Router();
  private blockRepo = new BlockRepo();
  private committeeRepo = new CommitteeRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, try$(this.getRecentEpochs));
    this.router.get(`${this.path}/:epoch`, try$(this.getEpochByNumber));
  }

  private getRecentEpochs = async (req, res) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const count = await this.committeeRepo.countAll();
    if (count <= 0) {
      return res.json({ totalRows: 0, epochs: [] });
    }
    const committees = await this.committeeRepo.findAll(page, limit);
    const snums = committees
      .filter((c) => !!c.endBlock)
      .map((c) => c.endBlock.number);
    const kblocks = await this.blockRepo.findByNumberList(snums);
    let blockMap = {};
    for (const b of kblocks) {
      blockMap[b.number] = b;
    }
    let epochs = [];
    for (const c of committees) {
      let powBlockCount = 0;
      if (c.endBlock && c.endBlock.number in blockMap) {
        const b = blockMap[c.endBlock.number];
        powBlockCount = b.powBlocks.length;
      }
      epochs.push({
        epoch: c.epoch,
        active: !c.endBlock,
        startKBlock: c.startBlock.number,
        startTime: c.startBlock.timestamp,
        endKBlock: c.endBlock ? c.endBlock.number : 0,
        endTime: c.endBlock ? c.endBlock.timestamp : 0,
        committeeSize: c.members.length,
        powBlockCount,
      });
    }
    res.json({ totalRows: count, epochs });
  };

  private getEpochByNumber = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const committee = await this.committeeRepo.findByEpoch(parseInt(epoch));
    if (!committee) {
      return res.json({
        summary: {},
        powBlocks: [],
        members: [],
      });
    }
    if (!committee.endBlock) {
      return res.json({
        summary: {
          epoch: committee.epoch,
          active: true,
          startKBlock: committee.startBlock.number,
          startTime: committee.startBlock.timestamp,
          committeeSize: committee.members.length,
          duration: 0,
        },
        members: committee.members,
        powBlocks: [],
      });
    }
    const num = committee.endBlock.number;
    const block = await this.blockRepo.findByNumber(num);
    return res.json({
      summary: {
        epoch: committee.epoch,
        active: false,
        startKBlock: committee.startBlock.number,
        startTime: committee.startBlock.timestamp,
        endKBlock: committee.endBlock.number,
        endTime: committee.endBlock.timestamp,
        duration: committee.endBlock.timestamp - committee.startBlock.timestamp,
        committeeSize: committee.members.length,
      },
      members: committee.members,
      powBlocks: block.powBlocks,
    });
  };
}
export default EpochController;
