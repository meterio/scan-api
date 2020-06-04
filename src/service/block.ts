import { getConnection, EntityManager } from 'typeorm';
import { Block } from '../powergrid-db/entity/block';
import { TransactionMeta } from '../powergrid-db/entity/tx-meta';

export const getBest = (manager?: EntityManager) => {
  if (!manager) {
    manager = getConnection().manager;
  }

  return manager.getRepository(Block).findOne({
    where: { isTrunk: true },
    order: { id: 'DESC' },
  }) as Promise<Block>;
};

export const getBlockByID = (blockID: string, manager?: EntityManager) => {
  if (!manager) {
    manager = getConnection().manager;
  }

  return manager.getRepository(Block).findOne({ id: blockID });
};

export const getBlockByNumber = (num: number, manager?: EntityManager) => {
  if (!manager) {
    manager = getConnection().manager;
  }

  return manager.getRepository(Block).findOne({ number: num, isTrunk: true });
};

export const getExpandedBlockByNumber = async (
  num: number,
  manager?: EntityManager
) => {
  if (!manager) {
    manager = getConnection().manager;
  }

  const block = await manager
    .getRepository(Block)
    .findOne({ number: num, isTrunk: true });

  if (!block) {
    return { block, txs: [] } as {
      block: Block | undefined;
      txs: TransactionMeta[];
    };
  }

  const txs = await manager.getRepository(TransactionMeta).find({
    where: { blockID: block.id },
    order: { seq: 'ASC' },
    relations: ['transaction'],
  });

  return { block, txs };
};

export const getExpandedBlockByID = async (
  id: string,
  manager?: EntityManager
) => {
  if (!manager) {
    manager = getConnection().manager;
  }

  const block = await manager.getRepository(Block).findOne({ id });

  if (!block) {
    return { block, txs: [] } as {
      block: Block | undefined;
      txs: TransactionMeta[];
    };
  }

  const txs = await manager.getRepository(TransactionMeta).find({
    where: { blockID: block.id },
    order: { seq: 'ASC' },
    relations: ['transaction'],
  });

  return { block, txs };
};
