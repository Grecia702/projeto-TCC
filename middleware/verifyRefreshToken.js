require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log('Conectado ao banco de dados no Railway'))
    .catch((err) => console.error('Erro ao conectar ao banco de dados', err));

const { verifyRefreshToken } = require('../Utils/tokenUtils');

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
