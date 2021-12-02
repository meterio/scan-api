import model from '../model/knownEvent.model';
import { KnownEvent } from '../model/knownEvent.interface';

export class KnownEventRepo {
  private model = model;

  public async findAll() {
    return this.model.find();
  }

  public async findBySignature(signature: string) {
    return this.model.findOne({ signature });
  }

  public async create(signature: string, name: string, abi: string) {
    return this.model.create({ signature, name, abi });
  }

  public async bulkInsert(knowEvents: KnownEvent[]) {
    return this.model.create(knowEvents);
  }
}

export default KnownEventRepo;
