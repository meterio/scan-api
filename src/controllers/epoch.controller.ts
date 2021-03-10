import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import BlockRepo from '../repo/block.repo';
import CommitteeRepo from '../repo/committee.repo';
import KnownRepo from '../repo/known.repo';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class EpochController implements Controller {
  public path = '/api/epochs';
  public router = Router();
  private blockRepo = new BlockRepo();
  private committeeRepo = new CommitteeRepo();
  private knownRepo = new KnownRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/recent`, try$(this.getRecentEpochs));
    this.router.get(
      `${this.path}/:epoch/members`,
      try$(this.getMembersByEpoch)
    );
    this.router.get(`${this.path}/:epoch`, try$(this.getEpochDetail));
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

  private getMembersByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const committee = await this.committeeRepo.findByEpoch(parseInt(epoch));
    if (!committee) {
      return res.json({
        totalRows: 0,
        members: [],
      });
    }
    const knowns = await this.knownRepo.findByKeyList(
      committee.members.map((m) => m.pubKey)
    );
    let knownMap = {};
    for (const k of knowns) {
      knownMap[k.ecdsaPK] = k;
    }
    const members = committee.members.map((m) => {
      if (m.pubKey in knownMap) {
        const k = knownMap[m.pubKey];
        return {
          index: m.index,
          pubKey: m.pubKey,
          netAddr: m.netAddr,
          name: k.name,
          description: k.description,
          address: k.address,
        };
      } else {
        return {
          index: m.index,
          pubKey: m.pubKey,
          netAddr: m.netAddr,
          name: '',
          description: '',
          address: '',
        };
      }
    });

    if (members.length >= (page - 1) * limit) {
      return res.json({
        totalRows: members.length,
        members: members.slice((page - 1) * limit, page * limit),
      });
    } else {
      return res.json({ totalRows: members.length, members: [] });
    }
  };

  private getEpochDetail = async (req: Request, res: Response) => {
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
      powBlocks: block.powBlocks,
    });
  };
}
export default EpochController;
