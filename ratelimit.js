// rateLimit.js
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        error: 'Muitas requisições. Tente de novo mais tarde.'
    }
})

module.exports = limiter
