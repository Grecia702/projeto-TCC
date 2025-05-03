require('dotenv').config();
const userModel = require("../models/userModel");
const { Pool } = require('pg');
const bcrypt = require('bcrypt')
const saltRounds = 12;
const moment = require('moment');
const logger = require('../utils/loggerConfig')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log('Conectado ao banco de dados no Railway'))
    .catch((err) => console.error('Erro ao conectar ao banco de dados', err));

const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

// LOGIN
const login = async (req, res) => {

    const { email, senha } = req.body;
    const agent = req.get('User-Agent')
    try {
        const usuarios = await userModel.FindUser(email);
        const usuario = usuarios.total > 0 ? usuarios.firstResult : null
        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!usuario) {
            return res.status(401).json({ message: 'E-mail e/ou senha incorretos!' });
        }
        if (senhaValida && usuario.email == email) {
            console.log("login feito pelo usuario ", usuario.email, "durante as", timestamp, "horas")
            const payload = {
                userId: usuario.id,
            };
            const { userId } = payload
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await pool.query('INSERT INTO refresh_tokens (usuario_id, token, user_agent, expires_at) VALUES ($1, $2, $3, $4)', [userId, refreshToken, agent, expiresAt]);
            logger.info(`Login feito pelo usuário de ID ${userId} as ${timestamp}. IP: ${req.ip}, User Agent: ${agent}`)
            return res.status(200).json({
                accessToken,
                refreshToken,
                message: 'Login bem-sucedido!'
            });

        } else {
            return res.status(401).json({ message: 'E-mail e/ou senha incorretos!' });
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'Erro ao processar a requisição', error: err.message });
    }
};


const refresh = async (req, res) => {
    const { userId } = req.user.decoded;
    const agent = req.get('User-Agent')
    const payload = {
        userId: userId,
    };
    const newAccessToken = generateAccessToken(payload);
    console.log("Token renovado com sucesso às", timestamp);
    logger.info(`Renovação de token feita pelo usuario ${userId} durante as ${timestamp}. IP: ${req.ip}, User-Agent: ${agent}`);
    return res.status(200).json({ message: 'Token renovado com sucesso', newAccessToken });
};

const signup = async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const searchUser = await userModel.FindUser(email);
        const uniqueEmail = searchUser.total === 0

        if (nome && email && senha) {
            if (!uniqueEmail) {
                console.log("email ja existe")
                return res.status(409).json({ message: 'Esse e-mail já está em uso!' });
            }
            const passwordHash = await bcrypt.hash(senha, saltRounds);
            userModel.CreateUser(nome, email, passwordHash)
            return res.status(201).json({ message: 'Usuário criado com sucesso!' });
        }
        else {
            console.log("Campos em branco");
            return res.status(400).json({ message: 'Campo(s) em branco' });
        }
    }
    catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err.message });
    }
}

const logout = async (req, res) => {
    const refreshToken = req.headers.authorization.split(' ')[1];
    const { userId } = req.user.decoded;
    const agent = req.get('User-Agent')

    if (!refreshToken) {
        return res.status(401).json({ message: 'Token ausente na requisição' });
    }
    try {
        const { rowCount } = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken])
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Token não encontrado' });
        }
        else {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
            console.log('Logout feito pelo usuário', userId)
            logger.info(`Logout feito pelo usuário de ID ${userId} as ${timestamp}. IP: ${req.ip}, User Agent: ${agent}`)
            return res.status(200).json({ message: 'Token apagado com sucesso' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Erro inesperado ao fazer logout', error: err.message });
    }
};

module.exports = {
    login,
    logout,
    refresh,
    signup
};
