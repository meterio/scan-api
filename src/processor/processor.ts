import { EntityManager, getConnection } from 'typeorm';
import { sleep, InterruptedError, WaitNextTickError } from '../utils';
import { EventEmitter } from 'events';
import { getBest, getExpandedBlockByNumber } from '../service/block';
import { SnapType } from '../powergrid-db/types';
import * as logger from '../logger';
import { Block } from '../powergrid-db/entity/block';
import { TransactionMeta } from '../powergrid-db/entity/tx-meta';

const SAMPLING_INTERVAL = 1 * 1000;

export abstract class Processor {
  protected abstract get snapType(): SnapType;
  protected head: number | null = null;
  protected birthNumber: number | null = null;
  private shutdown = false;
  private ev = new EventEmitter();

  public async start() {
    await this.beforeStart();
    this.loop();
    return;
  }

  public stop(): Promise<void> {
    this.shutdown = true;

    return new Promise((resolve) => {
      logger.log('shutting down......');
      this.ev.on('closed', resolve);
    });
  }

  protected abstract loadHead(manager?: EntityManager): Promise<number | null>;
  protected abstract saveHead(
    head: number,
    manager?: EntityManager
  ): Promise<void>;
  protected abstract bornAt(): Promise<number>;
  protected abstract processBlock(
    block: Block,
    txs: TransactionMeta[],
    manager: EntityManager,
    saveSnapshot?: boolean
  ): Promise<number>;
  protected abstract async latestTrunkCheck(): Promise<void>;

  protected async getHead() {
    if (this.head !== null) {
      return this.head;
    } else {
      const head = await this.loadHead();
      return head!;
    }
  }

  protected async processGenesis(): Promise<void> {
    return;
  }

  protected enoughToWrite(count: number) {
    return !!count;
  }

  private async beforeStart() {
    this.birthNumber = await this.bornAt();

    // process genesis
    const h = await this.loadHead();
    if (!h) {
      await this.processGenesis();
      this.head = this.birthNumber! - 1;
      await this.saveHead(this.head);
    }
  }

  private async loop() {
    for (;;) {
      try {
        if (this.shutdown) {
          throw new InterruptedError();
        }
        await sleep(SAMPLING_INTERVAL);
        await this.latestTrunkCheck();

        let head = await this.getHead();
        const best = await getBest();

        if (best.number <= head) {
          continue;
        }
        if (best.number - head > 0) {
          await this.fastForward(best.number);
          head = await this.getHead();
        }
        const timeLogger = logger.taskTime(new Date());
        await getConnection().transaction(async (manager) => {
          for (let i = head + 1; i <= best.number; i++) {
            const { block, txs } = await getExpandedBlockByNumber(i, manager);
            await this.processBlock(block!, txs, manager, true);
          }
          await this.saveHead(best.number, manager);
          logger.log(
            `-> save head: ${best.number}(${best.timestamp % 60}) ${timeLogger(
              new Date()
            )}`
          );
        });
        this.head = best.number;
      } catch (e) {
        if (e instanceof WaitNextTickError) {
          continue;
        } else if (e instanceof InterruptedError) {
          if (this.shutdown) {
            this.ev.emit('closed');
            break;
          }
        } else {
          logger.error(
            `processor(${this.constructor.name}) loop: ` + (e as Error).stack
          );
        }
      }
    }
  }

  private async fastForward(target: number) {
    const head = await this.getHead();

    let startNum = head + 1;
    console.time('time');
    let count = 0;
    for (let i = head + 1; i <= target; ) {
      await getConnection().transaction(async (manager) => {
        for (; i <= target; ) {
          if (this.shutdown) {
            throw new InterruptedError();
          }
          const { block, txs } = await getExpandedBlockByNumber(i++, manager);
          count += await this.processBlock(block!, txs, manager);

          if (i === target + 1) {
            await this.saveHead(i - 1, manager);
            process.stdout.write(
              `imported blocks(${i - startNum}) at block(${i - 1}) `
            );
            console.timeEnd('time');
            break;
          }

          if (this.enoughToWrite(count)) {
            await this.saveHead(i - 1, manager);
            count = 0;
            if (i - startNum >= 1000) {
              process.stdout.write(
                `imported blocks(${i - startNum}) at block(${i - 1}) `
              );
              console.timeEnd('time');
              console.time('time');
              startNum = i;
            }
            break;
          }
        }
      });
      this.head = i - 1;
    }
  }
}
