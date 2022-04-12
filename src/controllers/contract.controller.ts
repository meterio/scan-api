import { ContractFileRepo } from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

class ContractController implements Controller {
  public path = '/api/cfile';
  public router = Router();
  private contractFileRepo = new ContractFileRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, try$(this.getContractFiles));
  }

  private getContractFiles = async (req: Request, res: Response) => {
    const { address } = req.params;
    const files = await this.contractFileRepo.findAllByContract(address);
    return res.json({ files: files.map(f => f.toJSON()) });
  };
}
export default ContractController;
