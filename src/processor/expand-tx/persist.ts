import { EntityManager, getConnection, In } from 'typeorm';
import { Config } from '../../powergrid-db/entity/config';
import { Snapshot } from '../../powergrid-db/entity/snapshot';
import { AggregatedTransaction } from '../../powergrid-db/entity/aggregated-tx';

export type RecentSnapshot = Snapshot & { isTrunk: boolean };

export class Persist {
  private get HEAD_KEY() {
    return 'expand-tx-head';
  }

  public saveHead(val: number, manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    const config = new Config();
    config.key = this.HEAD_KEY;
    config.value = val.toString();

    return manager.save(config);
  }

  public async getHead(manager?: EntityManager): Promise<number | null> {
    if (!manager) {
      manager = getConnection().manager;
    }

    const head = await manager
      .getRepository(Config)
      .findOne({ key: this.HEAD_KEY });
    if (head) {
      return parseInt(head.value, 10);
    } else {
      return null;
    }
  }

  public saveTXs(txs: AggregatedTransaction[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.save(AggregatedTransaction, txs);
  }

  public removeTXs(ids: string[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.getRepository(AggregatedTransaction).delete({
      blockID: In([...ids]),
    });
  }
}
