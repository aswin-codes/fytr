const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),             // colored logs
    winston.format.timestamp(),            // add timestamp
    winston.format.errors({ stack: true }),// show full stack on errors
    winston.format.printf(
      ({ level, message, timestamp, stack }) =>
        `${timestamp} [${level}]: ${stack || message}`
    )
  ),
  transports: [
    new winston.transports.Console()
  ]
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
