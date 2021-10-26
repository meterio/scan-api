require('./utils/validateEnv');

import App from './app';
import AccountController from './controllers/account.controller';
import AuctionController from './controllers/auction.controller';
import BlockController from './controllers/block.controller';
import BucketController from './controllers/bucket.controller';
import EpochController from './controllers/epoch.controller';
import HomeController from './controllers/home.controller';
import KnownController from './controllers/known.controller';
import MetricController from './controllers/metric.controller';
import PowController from './controllers/pow.controller';
import SearchController from './controllers/search.controller';
import TokenController from './controllers/token.controller';
import TransferController from './controllers/transfer.controller';
import TxController from './controllers/tx.controller';
import ValidatorController from './controllers/validator.controller';

const app = new App([
  new BucketController(),
  new HomeController(),
  new SearchController(),
  new MetricController(),
  new BlockController(),
  new TxController(),
  new AccountController(),
  new PowController(),
  new TransferController(),
  new ValidatorController(),
  new AuctionController(),
  new EpochController(),
  new KnownController(),
  new TokenController(),
]);

app.listen();
