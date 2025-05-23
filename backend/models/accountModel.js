require('dotenv').config();
const pool = require('../db.js')


const CreateAccount = async (id_usuario, nome_conta, timestamp, saldo, tipo_conta, icone, desc_conta) => {
    const query = `
    INSERT INTO contasBancarias 
    (id_usuario , nome_conta, created_at, saldo, tipo_conta, icone, desc_conta) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`;

    await pool.query(query, [id_usuario, nome_conta, timestamp, saldo, tipo_conta, icone, desc_conta]);
}

const FindAccountByID = async (accountId, userId) => {
    const query = `
    SELECT id, nome_conta, saldo, tipo_conta, icone, desc_conta 
    FROM contasBancarias 
    WHERE id = $1 AND id_usuario = $2
    `;
    const { rows, rowCount } = await pool.query(query, [accountId, userId]);
    return { rows, total: rowCount, firstResult: rows[0] };
}

const UpdateAccount = async (id, nome_conta) => {
    await pool.query("UPDATE contasBancarias SET nome_conta = $1  WHERE id = $2", [nome_conta, id])
}

const DeleteAccount = async (id, userId) => {
    await pool.query("DELETE FROM contasBancarias WHERE id = $1 AND id_usuario = $2", [id, userId])
}

const ListAllAccounts = async (userId, limit, offset) => {
    const { rows, rowCount } = await pool.query("SELECT * FROM contasBancarias WHERE id_usuario = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", [userId, limit, offset]);
    return { rows, total: rowCount, firstResult: rows[0] };
}

const ListTransactionsByAccount = async (accountId, userId) => {
    const query = `
    SELECT b.nome_conta, t.categoria, t.tipo, t.valor, t.data_transacao 
    FROM contasBancarias AS b 
    JOIN transacoes AS t ON t.id_contaBancaria = b.id 
    WHERE id_usuario = $1 AND b.id= $2`;
    const { rows, rowCount } = await pool.query(query, [userId, accountId]);
    return { rows, total: rowCount, firstResult: rows[0] };
}

const AccountExists = async (account_name, userId) => {
    const { rows } = await pool.query(`SELECT EXISTS (SELECT 1 FROM contasBancarias WHERE nome_conta = $1 AND id_usuario = $2);`, [account_name, userId]);
    return rows[0].exists;
}

module.exports = { CreateAccount, FindAccountByID, UpdateAccount, DeleteAccount, ListAllAccounts, ListTransactionsByAccount, AccountExists };