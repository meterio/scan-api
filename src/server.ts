require('./utils/validateEnv');

import App from './app';
import HomeController from './controllers/home.controller';
import BlockController from './controllers/block.controller';
import TxController from './controllers/tx.controller';
import AccountController from './controllers/account.controller';
import PowController from './controllers/pow.controller';
import TransferController from './controllers/transfer.controller';

const app = new App([
  new HomeController(),
  new BlockController(),
  new TxController(),
  new AccountController(),
  new PowController(),
  new TransferController(),
]);

app.listen();
