// -*- mode: js; js-indent-level:2;  -*-
import Authorizer from './authorizer';
import BusKeeper from './bus_keeper';
import GarageDoor from './garage_door';
import IotThing from './iot/iot_thing';
import RfidReader from './rfid/rfid_reader';

import logger from './logger';

async function runApp() {
  logger.debug('Starting...');

  BusKeeper.init();
  const authorizer = new Authorizer()
  const garageDoor = new GarageDoor();
  const rfidReader = new RfidReader();
  const iotThing = new IotThing();

  process.on('SIGINT', async () => {
    try {
      await iotThing.stop();
      process.exit();
    }
    catch(e) {
      logger.error('Error stopping', { error: e, stack: e.stack });
      process.exit(1);
    }
  });

  try {
    iotThing.start();
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
