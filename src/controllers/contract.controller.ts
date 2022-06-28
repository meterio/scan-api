import { ContractFileRepo, ContractRepo } from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

class ContractController implements Controller {
  public path = '/api/cfile';
  public path1 = '/api/contract';
  public router = Router();
  private contractFileRepo = new ContractFileRepo();
  private contractRepo = new ContractRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, try$(this.getContractFiles));
    this.router.get(`${this.path1}/:address`, try$(this.getContractByAddress))
  }

  private getContractByAddress = async (req: Request, res: Response) => {
    const { address } = req.params;
    const contract = await this.contractRepo.findByAddress(address);
    return res.json({ contract: contract.toJSON() })
  }

  private getContractFiles = async (req: Request, res: Response) => {
    const { address } = req.params;
    const files = await this.contractFileRepo.findAllByContract(address);
    return res.json({ files: files.map(f => f.toJSON()) });
  };
}
export default ContractController;
