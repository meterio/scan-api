import { isAddress } from '@meterio/devkit/dist/cry';
import { AccountRepo, BlockRepo, TxRepo } from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';

import Controller from '../interfaces/controller.interface';

const hashPattern = new RegExp('^0x[0-9a-fA-F]{64}$');
const addrPattern = new RegExp('^0x[0-9a-fA-F]{40}$');

class SearchController implements Controller {
  public path = '/api/search';
  public router = Router();
  private blockRepo = new BlockRepo();
  private txRepo = new TxRepo();
  private accountRepo = new AccountRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:word`, try$(this.searchByWord));
  }

  private searchByWord = async (req: Request, res: Response) => {
    const { word } = req.params;

    // if it's hash, find it in tx and block collection
    if (hashPattern.test(word)) {
      const block = await this.blockRepo.findByHash(word);
      if (block) {
        return res.json({ type: 'block', data: block });
      }

      const tx = await this.txRepo.findByHash(word);
      if (tx) {
        return res.json({ type: 'tx', data: tx });
      }
      return res.json({ type: 'hash' });
    }

    // if it's address, find it in address collection
    if (addrPattern.test(word)) {
      const account = await this.accountRepo.findByAddress(word);
      if (account) {
        return res.json({ type: 'address', data: account });
      }
      return res.json({ type: 'address', data: { address: word } });
    }

    // if it's number, try to find in block collection
    let number = -1;
    try {
      number = Number(word);
      const block = await this.blockRepo.findByNumber(number);
      if (block) {
        return res.json({ type: 'block', data: block });
      }
    } catch (e) {
      console.log('could not find by number');
    }

    // otherwise, it's a keyword, find in account collection
    const account = await this.accountRepo.findByName(word);
    if (account) {
      return res.json({ type: 'address', data: account });
    }

    // fuzzy search
    const accounts = await this.accountRepo.findByFuzzyName(word);
    if (accounts) {
      return res.json({
        type: 'suggestions',
        items: accounts.map((a) => ({
          name: a.name,
          address: a.address,
          type: 'address',
        })),
      });
    }

    const contracts = await this.accountRepo.findByFuzzyName(word);
    if (contracts) {
      return res.json({
        type: 'suggestions',
        items: contracts.map((c) => ({
          name: c.name,
          address: c.name,
          type: 'address',
        })),
      });
    }

    return res.json({ type: 'unknown', data: {} });
  };
}

export default SearchController;
