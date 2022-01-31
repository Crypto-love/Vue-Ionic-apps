import winston from 'winston';
import dayjs from 'dayjs';
const currentDate = dayjs().format('YYYY/MM/DD');

const loggerOption = {
  file: {
    level: 'info',
    filename: `${__dirname}/../../../../logs/${currentDate}.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 10,
    colorize: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.simple(),
    winston.format.printf(
      (info) => `[${info.service}] - ${info.timestamp} - ${info.level} :  ${info.message}`
    )
  ),
  defaultMeta: {
    service: 'main-service'
  },
  transports: [new winston.transports.File(loggerOption.file)]
});

if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console(loggerOption.console));
}

export const stream = {
  write: (message) => {
    logger.info(message);
  }
};
