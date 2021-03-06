import * as mongoose from 'mongoose';

import { Head } from './head.interface';

const headSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  num: { type: Number, required: true },
});

headSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<Head & mongoose.Document>(
  'Head',
  headSchema,
  'heads'
);

export default model;
