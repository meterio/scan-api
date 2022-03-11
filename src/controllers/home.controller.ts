import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import * as pkg from '../../package.json';
import { MetricName } from '../const';
import Controller from '../interfaces/controller.interface';

import { MetricRepo } from '@meterio/scan-db';

class HomeController implements Controller {
  public path = '';
  public router = Router();
  private metricRepo = new MetricRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/mtrg`, try$(this.getMTRGCirculating));
    this.router.get(
      `${this.path}/mtrg/circulating`,
      try$(this.getMTRGCirculatingRaw)
    );
    this.router.get(
      `${this.path}/mtrg/totalsupply`,
      try$(this.getMTRGTotalsupplyRaw)
    );
    this.router.get(`${this.path}/probe/:ip`, try$(this.probe));
    this.router.get(`${this.path}`, try$(this.getHome));
  }

  private probe = async (req: Request, res: Response) => {
    const { ip } = req.params;
    try {
      const result = await axios.get(`http://${ip}:8670/probe`);
      res.json({ result: result.data });
    } catch (e) {
      console.log('ERROR: ', e);
      res.json({ result: null });
    }
  };
  private getHome = async (req: Request, res: Response) => {
    return res.json({ name: 'scan-api', version: pkg.version });
  };

  private getMTRGCirculatingRaw = async (req: Request, res: Response) => {
    const m = await this.metricRepo.findByKey(MetricName.MTRG_CIRCULATION);
    return res.send(new BigNumber(m.value).div(1e18).toFixed(0));
  };

  private getMTRGTotalsupplyRaw = async (req: Request, res: Response) => {
    return res.send(new BigNumber(40e6).toFixed(0));
  };

  private getMTRGCirculating = async (req: Request, res: Response) => {
    const m = await this.metricRepo.findByKey(MetricName.MTRG_CIRCULATION);
    return res.json({ circulation: m.value });
  };
}

export default HomeController;
