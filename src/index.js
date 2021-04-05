// -*- mode: js; js-indent-level:2;  -*-
import Authorizer from './authorizer';
import BusKeeper from './bus_keeper';
import GarageDoor from './garage_door';
import GarageDoorEvent from './mqtt/garage_door_event';
import RfidReader from './rfid/rfid_reader';

import logger from './logger';

async function runApp() {
  logger.debug('Starting...');

  BusKeeper.init();
  const authorizer = new Authorizer()
  const garageDoor = new GarageDoor();
  const rfidReader = new RfidReader();
  const garageDoorEvent = new GarageDoorEvent(logger);

  process.on('SIGINT', async () => {
    try {
      await garageDoorEvent.stop();
      process.exit();
    }
    catch(e) {
      logger.error('Error stopping', { error: e, stack: e.stack });
      process.exit(1);
    }
  });

  try {
    garageDoorEvent.sendConfig();
    await garageDoor.start();
    await rfidReader.start();
  }
  catch(e) {
    logger.error('Error', { error: e, stack: e.stack });
    process.exit(-1);
  }

  logger.info('Started', { env: process.env.NODE_ENV, });
}

runApp();
