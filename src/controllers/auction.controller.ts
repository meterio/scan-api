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
    this.router.get(`${this.path}/summaries`, try$(this.getSummaries));
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
        amount: `${fromWei(t.amount)} MTR`,
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
        released: `${fromWei(p.releasedMTRG)} MTRG`,
        reserved: `${fromWei(p.reservedMTRG)} MTRG`,
        reservedPrice: p.reservedPrice,
        received: `${fromWei(p.receivedMTR)} MTR`,
        auctionTxs: auctionTxs,
      },
    });
  };

  private getSummaries = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const summaries = await this.auctionRepo.findAllPagination(page, limit);
    if (!summaries || summaries.length <= 0) {
      return res.json({ summaries: [] });
    }
    const result = [];
    for (const s of summaries) {
      result.push(s.toSummary());
    }
    return res.json({ summaries: result });
  };
}
export default AuctionController;
