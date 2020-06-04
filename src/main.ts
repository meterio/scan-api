import { Network, getVIP180Token } from './const';
import { Foundation } from './sync';
import { Meter } from './meter-rest';
import { createConnection } from 'typeorm';
import { Net } from './net';
import { getMeterREST } from './utils';
import { Processor } from './processor/processor';
import { DualToken } from './processor/dual-token';
import { VIP180Transfer } from './processor/vip180';
import { ExpandTX } from './processor/expand-tx';
import * as logger from './logger';

const printUsage = (msg = '') => {
  logger.error(`${
    msg ? msg + '\n\n' : ''
  }Usage: node main.js [Network] [Task] [...Args]
--------
Network:    [main|test]
Task:       [sync]`);
  process.exit(-1);
};

if (process.argv.length < 4) {
  printUsage();
  process.exit(-1);
}

let net: Network;
switch (process.argv[2]) {
  case 'main':
    net = Network.MainNet;
    break;
  case 'test':
    net = Network.TestNet;
    break;
  default:
    printUsage('invalid network');
}

const meter = new Meter(new Net(getMeterREST()), net!);

let task: Foundation | Processor;
switch (process.argv[3]) {
  case 'sync':
    task = new Foundation(meter);
    break;
  case 'expand-tx':
    task = new ExpandTX(meter);
    break;
  case 'dual-token':
    task = new DualToken(meter);
    break;
  case 'token':
    if (!process.argv[4]) {
      printUsage('token symbol needed');
    }
    try {
      const token = getVIP180Token(net!, process.argv[4]);
      task = new VIP180Transfer(meter, token);
    } catch (e) {
      printUsage(e.message);
    }
    break;
  default:
    printUsage('invalid task name');
}
let shutdown = false;

createConnection()
  .then(async () => {
    await task.start();
  })
  .catch((e: Error) => {
    logger.error(
      `Start task(${process.argv[3]}) at Net(${process.argv[2]}): ` +
        (e as Error).stack
    );
    process.exit(-1);
  });

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach((sig) => {
  process.on(sig, (s) => {
    process.stdout.write(`got signal: ${s}, terminating
`);
    if (!shutdown) {
      shutdown = true;
      task.stop().then(() => {
        process.exit(0);
      });
    }
  });
});
