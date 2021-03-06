import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { EpochReward } from './epochReward.interface';

const epochRewardSchema = new mongoose.Schema({
  epoch: { type: Number, required: true, index: true },
  blockNum: { type: Number, required: true },
  txHash: { type: String, required: true },
  clauseIndex: { type: Number, required: true },

  address: { type: String, required: true },
  amount: {
    type: String,
    get: (num: string) => new BigNumber(num),
    set: (bnum: BigNumber) => bnum.toFixed(0),
    required: true,
  },
  type: {
    type: String,
    enum: ['autobid', 'transfer'],
    required: true,
  },
});

epochRewardSchema.set('toJSON', {
  transform: (obj, ret, options) => {
    delete ret.__v;
    delete ret._id;
    delete ret.blockNum;
    delete ret.epoch;
    delete ret.txHash;
    return ret;
  },
});

const model = mongoose.model<EpochReward & mongoose.Document>(
  'EpochReward',
  epochRewardSchema,
  'epochRewards'
);

export default model;
