import winston, { Logger, format, transports } from 'winston';
import path from 'path';

const logsDir = path.join(__dirname, '../logs');

// Criar logger com formato customizado
const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'scopum-api' },
  transports: [
    // Log de erros em arquivo separado
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: format.combine(format.timestamp(), format.json())
    }),

    // Log combinado em arquivo
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: format.combine(format.timestamp(), format.json())
    }),

    // Log no console em desenvolvimento
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// Log não capturado de exceções
logger.exceptions.handle(
  new transports.File({
    filename: path.join(logsDir, 'exceptions.log')
  })
);

// Log de promessas rejeitadas não capturadas
logger.rejections.handle(
  new transports.File({
    filename: path.join(logsDir, 'rejections.log')
  })
);

export default logger;
