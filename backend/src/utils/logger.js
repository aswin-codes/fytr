// Placeholder for logger.js
const logger = {
    info: (...args) => console.log('INFO:', ...args),
    warn: (...args) => console.warn('WARN:', ...args),
    error: (...args) => console.error('ERROR:', ...args),
    stream: {
        write: (message) => {
            console.log(message.trim());
        }
    }
};

module.exports = logger;
