import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';
import AuctionRepo from '../repo/auction.repo';
import BidRepo from '../repo/bid.repo';
import MetricRepo from '../repo/metric.repo';
import { extractPageAndLimitQueryParam, fromWei } from '../utils/utils';

class AuctionController implements Controller {
  public path = '/api/auctions';
  public router = Router();
  private auctionRepo = new AuctionRepo();
  private bidRepo = new BidRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/present`, try$(this.getPresentAuction));
    this.router.get(`${this.path}/past`, try$(this.getPastAuctions));
    this.router.get(`${this.path}/:id`, try$(this.getAuctionByID));
    this.router.get(`${this.path}/:id/bids`, try$(this.getAuctionBids));
  }

  private getPresentAuction = async (req: Request, res: Response) => {
    const present = await this.auctionRepo.findPresent();
    if (!present) {
      return res.json({ present: {} });
    }
    const bids = await this.bidRepo.findByAuctionID(present.id);
    res.json({ present: present.toSummary(), bids });
  };

  private getPastAuctions = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const auctions = await this.auctionRepo.findAllPast(page, limit);
    const count = await this.auctionRepo.countAll();
    if (!auctions || auctions.length <= 0) {
      return res.json({ totalPage: 0, auctions: [] });
    }
    return res.json({
      totalPage: Math.ceil(count / limit),
      auctions: auctions.map((a) => a.toSummary()),
    });
  };

  private getAuctionByID = async (req: Request, res: Response) => {
    const { id } = req.params;
    const auction = await this.auctionRepo.findByID(id);
    return res.json({ summary: auction.toSummary() });
  };

  private getAuctionBids = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const auction = await this.auctionRepo.findByID(id);
    const bids = await this.bidRepo.findByAuctionID(id, page, limit);
    const count = await this.bidRepo.countByAuctionID(id);
    return res.json({ totalPage: Math.ceil(count / limit), bids });
  };
}
export default AuctionController;
