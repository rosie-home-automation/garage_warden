import BusKeeper from './bus_keeper';
import logger from './logger';
import db from './models';

export default class Authorizer {
  #logger;

  constructor() {
    this.#logger = logger.child({ module: 'Authorizer' });
    this.bus = BusKeeper.authorizer;
    this.setupListeners();
  }

  setupListeners() {
    BusKeeper.rfidReader.on('read', async (type, value) => {
      const credential = await db.Credential.findOne({ where: { type: type, value: value }});
      if (credential) {
        this.authorized(credential);
      }
      else {
        this.unauthorized(type, value);
      }
    });
  }

  authorized(credential) {
    this.#logger.info(`Authorized ${credential.type} ${credential.name}`, { credential });
    this.bus.emit('authorized', credential);
  }

  unauthorized(type, value) {
    this.#logger.info(`Unauthorized ${type} ${value}`, { type, value });
    this.bus.emit('unauthorized', type, value);
  }
}
