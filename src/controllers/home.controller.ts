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
    this.router.get(
      ``,
      try$(async (req: Request, res: Response) => {
        return res.json({ 'scan-api': 'ok' });
      })
    );
  }
}

export default HomeController;
