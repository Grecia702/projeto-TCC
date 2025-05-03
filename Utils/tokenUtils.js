require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return { valid: true, expired: false, decoded };
    } catch (err) {
        const decoded = jwt.decode(token);
        if (err.name === 'TokenExpiredError') {
            return { valid: false, expired: true, decoded };
        }
        return {
            valid: false,
            expired: false,
            error: err.message,
            err: err.name,
            rawError: err,
            decoded
        };
    }
};

const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return { valid: true, expired: false, decoded };
    } catch (err) {
        return { valid: false, expired: err.name === 'TokenExpiredError', error: err.message };
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};