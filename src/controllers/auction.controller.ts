import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import { MetricName } from '../const';
import Controller from '../interfaces/controller.interface';
import AuctionRepo from '../repo/auction.repo';
import MetricRepo from '../repo/metric.repo';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

class AuctionController implements Controller {
  public path = '/api/auctions';
  public router = Router();
  private auctionRepo = new AuctionRepo();
  private metricRepo = new MetricRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/present`, try$(this.getPresentAuction));
    this.router.get(`${this.path}/past`, try$(this.getPastAuctions));
    this.router.get(`${this.path}/:id/bids`, try$(this.getAuctionBids));
    this.router.get(`${this.path}/:id/dists`, try$(this.getAuctionDists));
  }

  private convertPresentAuction = (p) => {
    let auctionTxs = [];
    for (const t of p.auctionTxs) {
      auctionTxs.push({
        txid: t.txid,
        address: t.address,
        amount: t.amount,
        amountStr: `${fromWei(t.amount)} MTR`,
        type: t.type,
        nonce: t.nonce,
        timestamp: t.lastTime,
      });
    }
    return {
      summary: {
        id: p.auctionID,
        startHeight: p.startHeight,
        startEpoch: p.startEpoch,
        endHeight: p.endHeight,
        endEpoch: p.endEpoch,
        sequence: p.sequence,
        createTime: p.createTime,
        bidCount: p.auctionTxs.length ? p.auctionTxs.length : 0,
        released: p.releasedMTRG,
        releasedStr: `${fromWei(p.releasedMTRG)} MTRG`,
        received: p.receivedMTR,
        receivedStr: `${fromWei(p.receivedMTR)} MTR`,
        reserved: '0',
        reservedStr: '0 MTRG',
        reservedPrice: p.reservedPrice,
        actualPrice: '0',
        leftover: '0',
        leftoverStr: '0 MTRG',
      },
      bids: auctionTxs,
    };
  };

  private getPresentAuction = async (req: Request, res: Response) => {
    const present = await this.metricRepo.findByKey(MetricName.PRESENT_AUCTION);
    if (!present || present.value == '{}') {
      return res.json({ present: {} });
    }
    const p = JSON.parse(present.value);
    const converted = this.convertPresentAuction(p);
    res.json({ present: converted.summary, bids: converted.bids });
  };

  private getPastAuctions = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const auctions = await this.auctionRepo.findAllPagination(page, limit);
    const count = await this.auctionRepo.countAll();
    if (!auctions || auctions.length <= 0) {
      return res.json({ totalPage: 0, auctions: [] });
    }
    const result = [];
    for (const s of auctions) {
      result.push(s.toSummary());
    }
    return res.json({ totalPage: Math.ceil(count / limit), auctions: result });
  };

  private getAuctionBids = async (req: Request, res: Response) => {
    const { id } = req.params;
    const present = await this.metricRepo.findByKey(MetricName.PRESENT_AUCTION);
    if (present && present.value != '{}') {
      const p = JSON.parse(present.value);
      if (id === p.auctionID) {
        return res.json(this.convertPresentAuction(p));
      }
    }

    const auction = await this.auctionRepo.findByID(id);
    if (!auction) {
      return res.json({ bids: [] });
    }
    return res.json({ summary: auction.toSummary(), bids: auction.txs });
  };

  private getAuctionDists = async (req: Request, res: Response) => {
    const { id } = req.params;
    const auction = await this.auctionRepo.findByID(id);
    if (!auction) {
      return res.json({ dists: [] });
    }
    return res.json({ summary: auction.toSummary(), dists: auction.distMTRG });
  };
}
export default AuctionController;
