import model from '../model/knownMethod.model';
import { KnownMethod } from '../model/knownMethod.interface';

export class KnownMethodRepo {
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

  public async bulkInsert(knowMethods: KnownMethod[]) {
    return this.model.create(knowMethods);
  }
}

export default KnownMethodRepo;
