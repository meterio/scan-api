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
    this.router.get(`${this.path1}/:address`, try$(this.getContractByAddress));
  }

  private getContractByAddress = async (req: Request, res: Response) => {
    const { address } = req.params;
    const contract = await this.contractRepo.findByAddress(address);
    return res.json({ contract: contract.toJSON() });
  };

  private getContractFiles = async (req: Request, res: Response) => {
    const { address } = req.params;
    const contract = await this.contractRepo.findByAddress(address);
    let result = {};
    if (contract.verified && contract.status === 'match') {
      // code-match verification, use `verifiedFrom` to find files
      const files = await this.contractFileRepo.findAllByContract(
        contract.verifiedFrom
      );
      result = { files: files.map((f) => f.toJSON()) };
    } else if (contract.verified) {
      // sourcify verification, use `address` to find files
      const files = await this.contractFileRepo.findAllByContract(address);
      result = { files: files.map((f) => f.toJSON()) };
    }
    return res.json(result);
  };
}
export default ContractController;
