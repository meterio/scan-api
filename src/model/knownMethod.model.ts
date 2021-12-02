import * as mongoose from 'mongoose';

import { KnownMethod } from './knownMethod.interface';

const knownMethodSchema = new mongoose.Schema<KnownMethod>({
  signature: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  abi: { type: String, required: true },
});

knownMethodSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<KnownMethod & mongoose.Document>(
  'KnownMethod',
  knownMethodSchema,
  'knownMethods'
);

export default model;
