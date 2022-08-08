import { ContractRepo, NFTRepo } from '@meterio/scan-db/dist';
import { resolveObjectURL } from 'buffer';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { getCuratedNFTs, getEnvNetwork } from '../const';

import Controller from '../interfaces/controller.interface';
import { extractPageAndLimitQueryParam } from '../utils/utils';

class NFTController implements Controller {
  public path = '/api/nfts';
  public router = Router();

  private nftRepo = new NFTRepo();
  private contractRepo = new ContractRepo();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/curated`, try$(this.getCuratedCollections));
    this.router.get(
      `${this.path}/:address/tokens`,
      try$(this.getTokensInCollection)
    );
  }

  private getCuratedCollections = async (req: Request, res: Response) => {
    const { page, limit } = extractPageAndLimitQueryParam(req);
    const { network } = getEnvNetwork();
    const curatedAddrs = getCuratedNFTs(network);
    const paginate = await this.contractRepo.paginateWithAddressList(
      curatedAddrs,
      page,
      limit
    );
    /*
    - getAllCollections - this gives all NFT that stored on your DB
request: page, limit
return: collection list [nftAddress, nftCreator, createTxHash, createBlockNumber, nftName, nftSymbol, nftType]

    */
    return res.json({
      totalRows: paginate.count,
      collections: paginate.result,
    });
  };

  /*
  - getAllNFTs - this gives all NFT token that stored on your DB
request: page, limit
return: nft list [nft Address, nftCreator, nftName, nftSymbol, nftType, nftTokenID, tokenURI, nft minter, created timestamp, nft token media URI, nft token media type(image or video), nft token JSON]

  */
  private getTokensInCollection = async (req: Request, res: Response) => {
    const { address } = req.params;
    const { page, limit } = extractPageAndLimitQueryParam(req);

    const contract = await this.contractRepo.findByAddress(address);
    if (!contract) {
      return res.json({ totalRows: 0, nfts: [], contract });
    }
    delete contract.code;
    const paginate = await this.nftRepo.paginateByAddress(address, page, limit);
    return res.json({
      totoalRows: paginate.count,
      nfts: paginate.result.map((n) => {}),
      contract,
    });
  };
}

export default NFTController;
