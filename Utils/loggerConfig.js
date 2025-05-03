const winston = require('winston');
const moment = require('moment');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(

        winston.format.printf(({ level, message }) => {
            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/app.log' })
    ]
});


module.exports = logger;
