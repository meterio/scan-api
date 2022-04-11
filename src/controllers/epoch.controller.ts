import {
  BlockRepo,
  CommitteeRepo,
  KnownRepo,
  Network,
  Block,
} from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { getDelegates, getEnvNetwork } from '../const';
import Controller from '../interfaces/controller.interface';
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
    this.router.get(`${this.path}/:epoch/stats`, try$(this.getStatsByEpoch));
  }

  private getRecentEpochs = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const paginate = await this.committeeRepo.paginateAll(page, limit);
    const snums = paginate.result
      .filter((c) => !!c.endBlock)
      .map((c) => c.endBlock.number);
    console.log(snums);
    const kblocks = await this.blockRepo.findByNumberList(snums);
    let blockMap = {};
    for (const b of kblocks) {
      blockMap[b.number] = b;
    }
    let epochs = [];
    for (const c of paginate.result) {
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
    res.json({ totalRows: paginate.count, epochs });
  };

  private getMembersByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const committee = await this.committeeRepo.findByEpoch(parseInt(epoch));
    if (!committee) {
      return res.json({
        totalRows: 0,
        startBlock: 0,
        endBlock: 0,
        kblockHeight: 0,
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
    const { network } = getEnvNetwork();
    const delegates = getDelegates(network);
    if (delegates) {
      for (const d of delegates) {
        knownMap[d.pub_key] = d;
      }
    }
    let visited = {};
    const members = committee.members
      .map((m) => {
        if (visited[m.pubKey]) {
          return;
        }
        visited[m.pubKey] = true;
        const k = knownMap[m.pubKey];
        return {
          index: m.index,
          pubKey: m.pubKey,
          netAddr: m.netAddr,
          name: k ? k.name : '',
          description: k ? k.description || '' : '',
          address: k ? k.address : '',
        };
      })
      .filter((v) => !!v);

    if (members.length >= (page - 1) * limit) {
      return res.json({
        totalRows: members.length,
        members: members.slice((page - 1) * limit, page * limit),
        startBlock: committee.startBlock,
        endBlock: committee.endBlock,
        kblockHeight: committee.kblockHeight,
      });
    } else {
      return res.json({
        totalRows: members.length,
        members: [],
        startBlock: committee.startBlock,
        endBlock: committee.endBlock,
        kblockHeight: committee.kblockHeight,
      });
    }
  };

  private getStatsByEpoch = async (req: Request, res: Response) => {
    const { epoch } = req.params;
    const committee = await this.committeeRepo.findByEpoch(parseInt(epoch));
    if (!committee || !committee.endBlock || committee.endBlock.number == 0) {
      return res.json({
        startBlock: 0,
        endBlock: 0,
        members: [],
        stats: [],
      });
    }
    const knowns = await this.knownRepo.findByKeyList(
      committee.members.map((m) => m.pubKey)
    );
    let knownMap = {};
    for (const k of knowns) {
      knownMap[k.ecdsaPK] = k;
    }

    const { network } = getEnvNetwork();
    const delegates = getDelegates(network);
    if (delegates) {
      for (const d of delegates) {
        const ecdsaKey = d.pub_key.split(':::')[0];
        knownMap[ecdsaKey] = d;
      }
    }
    let visited = {};
    const members = committee.members
      .map((m) => {
        if (m.pubKey in visited) {
          return undefined;
        }
        visited[m.pubKey] = true;
        const k = knownMap[m.pubKey];
        return {
          index: m.index,
          netAddr: m.netAddr,
          name: k ? k.name : '',
          address: k ? k.address : '',
        };
      })
      .filter((v) => !!v);
    const memberMap = {};
    members.forEach((m) => {
      memberMap[m.index] = m;
    });

    const blocks = await this.blockRepo.findByNumberInRange(
      committee.startBlock.number,
      committee.endBlock.number
    );

    const lastBlock = blocks[blocks.length - 1];
    const lastRound = lastBlock.qc.qcRound;

    const stats = this.calcStats(blocks, memberMap, lastRound);

    return res.json({
      startBlock: committee.startBlock,
      endBlock: committee.endBlock,
      members,
      stats,
    });
  };

  private calcStats = (
    blocks: Block[],
    memberMap: { [key: number]: any },
    lastRound: number
  ) => {
    let curIndex = 0;
    let stats: number[][] = [];
    const size = Object.keys(memberMap).length;

    for (var i: number = 0; i < lastRound / size + 1; i++) {
      stats[i] = [];
      for (var j: number = 0; j < size; j++) {
        stats[i][j] = 0;
      }
    }
    // console.log(`last round: `, lastRound, 'size:', size);

    try {
      for (const b of blocks) {
        // console.log('block beneficary:', b.beneficiary, ', number:', b.number);
        let foundInLoop = false;
        for (let k = 0; k < size; k++) {
          const v = memberMap[curIndex % size];
          const row = Math.floor(curIndex / size);
          const col = curIndex % size;
          // console.log(`row: `, row);
          // console.log(`col: `, curIndex % size);
          // console.log(
          //   'validator: ',
          //   v.address.toLowerCase(),
          //   v.address.toLowerCase() === b.beneficiary.toLowerCase()
          // );
          const vaddr = v.address.replace('0x0x', '0x').toLowerCase();
          if (vaddr === b.beneficiary.toLowerCase()) {
            foundInLoop = true;
            stats[row][col] = 1; // correct proposer
            curIndex++;
            break;
          } else {
            stats[row][col] = 2; // incorrect proposer
          }
          curIndex++;
        }
        if (foundInLoop === false) {
          return stats;
        }
      }
      return stats;
    } catch (e) {
      console.log(e);
      return '';
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
