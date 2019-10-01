import pino from 'pino';
import { logging as config } from 'config';

const buildLogger = () => {
  const logger = pino({ level: config.level });
  return logger;
};

export default buildLogger();
