require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const { verifyRefreshToken } = require('../utils/tokenUtils');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Refresh token não enviado' });
    }
    const refreshToken = authHeader.split(' ')[1];
    const userAgent = req.get('User-Agent');
    const result = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND user_agent = $2',
        [refreshToken, userAgent]
    );

    if (result.rowCount === 0) {
        return res.status(401).json({ message: 'Refresh token não existe' });
    }
    try {
        const decoded = verifyRefreshToken(refreshToken);
        req.user = decoded;
        req.refreshToken = refreshToken;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
            return res.status(401).json({ message: 'Refresh token expirado' });
        }
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
};
