const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports:
    process.env.NODE_ENV === 'test'
      ? [new transports.Console({ silent: true })]
      : [
          new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
          }),
        ],
});

module.exports = logger;
