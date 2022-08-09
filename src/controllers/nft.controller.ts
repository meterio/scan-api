import { ContractRepo, NFTRepo } from '@meterio/scan-db/dist';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { getCuratedNFTs, getEnvNetwork } from '../const';

import Controller from '../interfaces/controller.interface';
import { blockIDtoNum, extractPageAndLimitQueryParam } from '../utils/utils';

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
    if (paginate.result)
      return res.json({
        totalRows: paginate.count,
        collections: paginate.result.map((c) => ({
          address: c.address,
          name: c.name,
          symbol: c.symbol,
          type: c.type,
          createTxHash: c.creationTxHash,
          createBlockNum: c.firstSeen.number,
          createTimestamp: c.firstSeen.number,
          creator: c.master,
        })),
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
      nfts: paginate.result.map((n) => ({
        address: n.address,
        tokenId: n.tokenId,
        type: n.type,
        tokenURI: n.tokenURI || '',
        tokenJSON: n.tokenJSON || '{}',

        mediaURI: n.mediaURI || '',
        mediaType: n.mediaType || '',
        minter: n.minter,
        createTxHash: n.creationTxHash,
        createBlockNum: n.block.number,
        createTimestamp: n.block.timestamp,
      })),
      collection: {
        name: contract.name,
        symbol: contract.symbol,
        creator: contract.master,
        type: contract.type,
      },
    });
  };
}

export default NFTController;
