require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const { verifyAccessToken } = require('../utils/tokenUtils');

module.exports = (req, res, next) => {
    let token = req.cookies.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido' });
    }
    try {
        const decoded = verifyAccessToken(token);
        if (decoded.expired) {
            return res.status(401).json({ message: 'Token de acesso expirado' })
        }

        if (!decoded.valid) {
            return res.status(401).json({ message: 'Token de acesso invalido' })
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Token inválido', error: error.message });
    }
};

