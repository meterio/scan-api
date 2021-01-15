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

  private getPresentAuction = async (req: Request, res: Response) => {
    const present = await this.metricRepo.findByKey(MetricName.PRESENT_AUCTION);
    if (!present || present.value == '{}') {
      return res.json({ present: {} });
    }
    const p = JSON.parse(present.value);
    let auctionTxs = [];
    for (const t of p.auctionTxs) {
      auctionTxs.push({
        address: t.addr,
        amount: t.amount,
        amountStr: `${fromWei(t.amount)} MTR`,
        count: t.count,
        nonce: t.nonce,
        timestamp: t.lastTime,
      });
    }
    return res.json({
      present: {
        id: p.auctionID,
        startHeight: p.startHeight,
        startEpoch: p.startEpoch,
        endHeight: p.endHeight,
        endEpoch: p.endEpoch,
        createTime: p.createTime,
        released: p.releasedMTRG,
        releasedStr: `${fromWei(p.releasedMTRG)} MTRG`,
        reserved: p.reservedMTRG,
        reservedStr: `${fromWei(p.reservedMTRG)} MTRG`,
        reservedPrice: p.reservedPrice,
        received: p.receivedMTR,
        receivedStr: `${fromWei(p.receivedMTR)} MTR`,
        bids: auctionTxs,
      },
    });
  };

  private getPastAuctions = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const auctions = await this.auctionRepo.findAllPagination(page, limit);
    if (!auctions || auctions.length <= 0) {
      return res.json({ auctions: [] });
    }
    const result = [];
    for (const s of auctions) {
      result.push(s.toSummary());
    }
    return res.json({ auctions: result });
  };

  private getAuctionBids = async (req: Request, res: Response) => {
    const { id } = req.params;
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
