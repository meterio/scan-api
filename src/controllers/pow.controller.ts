import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

class PowController implements Controller {
  public path = '/api/pows';
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

export default PowController;
