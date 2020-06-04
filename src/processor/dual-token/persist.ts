import { getConnection, EntityManager, In } from 'typeorm';
import { Config } from '../../powergrid-db/entity/config';
import { AssetMovement } from '../../powergrid-db/entity/movement';
import { Account } from '../../powergrid-db/entity/account';
import { AssetType } from '../../powergrid-db/types';

const HEAD_KEY = 'dual-token-head';

export class Persist {
  public saveHead(val: number, manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    const config = new Config();
    config.key = HEAD_KEY;
    config.value = val.toString();

    return manager.save(config);
  }

  public async getHead(manager?: EntityManager): Promise<number | null> {
    if (!manager) {
      manager = getConnection().manager;
    }

    const head = await manager.getRepository(Config).findOne({ key: HEAD_KEY });
    if (head) {
      return parseInt(head.value, 10);
    } else {
      return null;
    }
  }

  public saveMovements(moves: AssetMovement[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.save(AssetMovement, moves);
  }

  public saveAccounts(accs: Account[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.save(accs);
  }

  public removeMovements(ids: string[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.getRepository(AssetMovement).delete({
      blockID: In([...ids]),
      asset: In([AssetType.VET, AssetType.VTHO]),
    });
  }

  public removeAccounts(accs: string[], manager?: EntityManager) {
    if (!manager) {
      manager = getConnection().manager;
    }

    return manager.getRepository(Account).delete({
      address: In([...accs]),
    });
  }
}
