// -*- mode: js; js-indent-level:2;  -*-
import Authorizer from './authorizer';
import BusKeeper from './bus_keeper';
import GarageDoor from './garage_door';
import IotThing from './iot/iot_thing';
import RfidReader from './rfid/rfid_reader';
import pino from 'pino';

import logger from './logger';
import db from './models';

async function runApp() {
  logger.debug('Starting...');

  BusKeeper.init();
  const authorizer = new Authorizer()
  const garageDoor = new GarageDoor();
  const rfidReader = new RfidReader();
  const iotThing = new IotThing();

  process.on('uncaughtException', pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'uncaughtException');
    process.exit(-1);
  }));

  process.on('unhandledRejection', pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'unhandledRejection');
    process.exit(-1);
  }));

  process.on('SIGINT', async () => {
    try {
      await iotThing.stop();
      process.exit();
    }
    catch(e) {
      logger.error({ error: e, stack: e.stack }, 'Error stopping');
      process.exit(1);
    }
  });

  try {
    iotThing.start();
    await garageDoor.start();
    await rfidReader.start();
  }
  catch(e) {
    logger.error({ error: e, stack: e.stack }, 'Error');
    process.exit(-1);
  }

  logger.info('Started');
}

runApp();
