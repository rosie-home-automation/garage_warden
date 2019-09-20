import generate from 'nanoid/generate';
import { lowercase, nolookalikes, numbers, uppercase } from 'nanoid-dictionary';

export default class IdGenerator {
  static id() {
    return generate(lowercase + uppercase + numbers, 21);
  }

  static humanizedId() {
    return generate(nolookalikes, 12);
  }
}
