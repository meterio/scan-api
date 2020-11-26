import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

class HomeController implements Controller {
  public path = '/';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, try$(this.getHome));
    this.router.get(`${this.path}/api/dashboard/metric`, try$(this.getMetric));
  }

  private getHome = async (req: Request, res: Response) => {
    return res.json({ 'scan-api': 'ok' });
  };

  private getMetric = async (req, res) => {
    return res.json({});
  };
}

export default HomeController;
