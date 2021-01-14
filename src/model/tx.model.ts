import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { Token, ZeroAddress, enumKeys } from '../const';
import { fromWei } from '../utils/utils';
import { blockConciseSchema } from './blockConcise.model';
import { Tx } from './tx.interface';

const clauseSchema = new mongoose.Schema(
  {
    to: { type: String, required: false },
    value: {
      type: String,
      get: (num: string) => new BigNumber(num),
      set: (bnum: BigNumber) => bnum.toFixed(0),
      required: true,
    },
    token: {
      type: String,
      enum: enumKeys(Token),
      get: (enumValue: string) => Token[enumValue as keyof typeof Token],
      set: (enumValue: Token) => Token[enumValue],
      required: true,
    },
    data: { type: String, required: true },
  },
  { _id: false }
);

const posEventSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    topics: [{ type: String, required: true }],
    data: { type: String, required: true },
  },
  { _id: false }
);

const posTransferSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { _id: false }
);

const txOutputSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: false },
    events: [posEventSchema],
    transfers: [posTransferSchema],
  },
  { _id: false }
);

const txSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true, index: { unique: true } },

    block: blockConciseSchema,
    txIndex: { type: Number, required: true },

    chainTag: { type: Number, required: true },
    blockRef: { type: String, required: true },
    expiration: { type: Number, required: true },
    gasPriceCoef: { type: Number, required: true },
    gas: { type: Number, required: true },
    nonce: { type: String, required: true },
    dependsOn: { type: String, required: false },
    origin: { type: String, required: true },

    clauses: [clauseSchema],
    clauseCount: { type: Number, required: true },
    size: { type: Number, required: true },

    // receipt
    gasUsed: { type: Number, required: true },
    gasPayer: { type: String, required: true },
    paid: {
      type: String,
      get: (num: string) => new BigNumber(num),
      set: (bnum: BigNumber) => bnum.toFixed(0),
      required: true,
    },
    reward: {
      type: String,
      get: (num: string) => new BigNumber(num),
      set: (bnum: BigNumber) => bnum.toFixed(0),
      required: true,
    },
    reverted: {
      type: Boolean,
      required: true,
    },
    outputs: [txOutputSchema],

    createdAt: { type: Number, index: true },
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: false,
    },
  }
);

txSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

txSchema.methods.getType = function () {
  for (const c of this.clauses) {
    if (c.data !== '0x') {
      return 'call';
    }
  }
  if (this.origin === ZeroAddress) {
    return 'reward';
  }
  return 'transfer';
};

txSchema.methods.getTotalAmounts = function () {
  if (!this.clauses || this.clauses.length === 0) {
    return { amounts: ['0'], amountStrs: ['0 MTR'] };
  }
  if (this.clauses.length === 1) {
    const c = this.clauses[0];
    return {
      amounts: [c.value],
      amountStrs: `${fromWei(c.value)} ${Token[c.token]}`,
    };
  }
  let mtr = new BigNumber(0);
  let mtrg = new BigNumber(0);
  let mtrUsed = false;
  let amountStr = '';
  for (const c of this.clauses) {
    if (c.token === Token.MTR) {
      mtr = mtr.plus(c.value);
      mtrUsed = true;
    }
    if (c.token === Token.MTRG) {
      mtrg = mtrg.plus(c.value);
    }
  }
  let amounts = [];
  let amountStrs = [];
  if (mtr.isGreaterThan(0)) {
    amounts.push(mtr.toFixed());
    amountStrs.push(`${fromWei(mtr, 3)} MTR`);
  }
  if (mtrg.isGreaterThan(0)) {
    amounts.push(mtrg.toFixed());
    amountStrs.push(`${(fromWei(mtrg), 3)} MTRG`);
  }
  console.log(amountStr);
  if (amountStrs.length <= 0) {
    amounts.push('0');
    amountStrs.push(mtrUsed ? '0 MTR' : '0 MTRG');
  }
  return { amounts, amountStrs };
};

txSchema.methods.toSummary = function () {
  const a = this.getTotalAmounts();
  const tos = {};
  for (const c of this.clauses) {
    const amt = new BigNumber(c.value);
    tos[c.to] = true;
  }

  return {
    hash: this.hash,
    block: this.block,
    origin: this.origin,
    clauseCount: this.clauses ? this.clauses.length : 0,
    type: this.getType(),
    paid: this.paid,
    totalAmounts: a.amounts,
    totalAmountStr: a.amountStrs,
    fee: this.paid.toFixed(),
    feeStr: `${fromWei(this.paid)} MTR`,
    reverted: this.reverted,
    tos: Object.keys(tos),
  };
};

const model = mongoose.model<Tx & mongoose.Document>('tx', txSchema, 'txs');

export default model;
