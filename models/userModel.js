require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const CreateUser = async (nome, email, senha) => {
    await pool.query("INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3)", [nome, email, senha]);
}

const ListUser = async (id) => {
    const { rows, rowCount } = await pool.query("SELECT id, nome, email, senha FROM usuario WHERE id = $1", [id]);
    return { rows, total: rowCount, firstResult: rows[0] };
}

const UpdateUser = async (id, email) => {
    await pool.query("UPDATE usuario SET email = $1  WHERE id = $2", [email, id])
}

const DeleteUser = async (id) => {
    await pool.query("DELETE FROM usuario WHERE id = $1", [id])
}

const FindUser = async (email) => {
    const { rows, rowCount } = await pool.query("SELECT id, email, senha FROM usuario WHERE email = $1", [email]);
    return { rows, total: rowCount, firstResult: rows[0] };
}
module.exports = { FindUser, CreateUser, ListUser, UpdateUser, DeleteUser };