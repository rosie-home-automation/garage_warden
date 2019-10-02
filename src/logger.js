import chalk from 'chalk';
import winston from 'winston';
import { logging as config } from 'config';
import _ from 'lodash';

const logger = winston.createLogger({
  level: config.level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: {},
  transports: [
    new winston.transports.File({ filename: config.logFilePath })
  ]
});

if (process.env.NODE_ENV === 'development') {
  const levelMessage = (level, msg) => {
    msg = msg.toUpperCase();
    switch(level) {
      case 'debug':
        return chalk.cyanBright(msg);
      case 'info':
        return chalk.greenBright(msg);
      case 'warn':
        return chalk.yellowBright(msg);
      case 'error':
        return chalk.redBright(msg);
      default:
        return chalk.gray(msg);
    }
  };

  const consoleFormat = winston.format.printf(({ level, message, timestamp, ...data }) => {
    const levelMsg = levelMessage(level, level);
    const responseTime = _.get(data, 'meta.responseTime');
    const responseTimeMsg = responseTime ? chalk.yellow(`${responseTime} ms`) : '';
    return `${chalk.blueBright(timestamp)} [${levelMsg}]: ${message} ${chalk.gray(JSON.stringify(data))} ${responseTimeMsg}`;
  });

  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

export default logger;
