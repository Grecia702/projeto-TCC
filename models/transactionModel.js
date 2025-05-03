require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const checkValidAccount = async (accountId, userId) => {
    const query = `
    SELECT 1 
    FROM contasBancarias 
    WHERE id = $1 AND id_usuario = $2
  `;
    const { rowCount } = await pool.query(query, [accountId, userId]);
    return rowCount > 0;
}

const CreateTransaction = async (id_contabancaria, categoria, tipo, valor, data_transacao, natureza, recorrente, frequencia_recorrencia, proxima_ocorrencia) => {
    const query = `
    INSERT INTO transacoes (id_contabancaria, categoria, tipo, valor, data_transacao, natureza , recorrente, frequencia_recorrencia, proxima_ocorrencia) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await pool.query(query, [id_contabancaria, categoria, tipo, valor, data_transacao, natureza, recorrente, frequencia_recorrencia, proxima_ocorrencia]);
}

const ReadTransaction = async (userId, transactionId) => {
    const { rows, rowCount } = await pool.query("SELECT * FROM user_transactions WHERE user_id = $1 AND transaction_id = $2 ", [userId, transactionId]);
    return { rows, total: rowCount, firstResult: rows[0] };
}

const UpdateTransaction = async (id, campos) => {
    const setClause = Object.keys(campos)
        .map((campo, i) => `${campo} = $${i + 1}`)
        .join(', ');

    const valores = Object.values(campos);

    const query = `
        UPDATE transacoes t
        SET ${setClause} 
        FROM usuario u
        JOIN contasBancarias b ON b.id = u.id 
        WHERE u.id = $1
        AND t.id = $2
        RETURNING u.*;
    `;
    const parametros = [...valores, id, campos.id_transacao];
    return await pool.query(query, parametros);
};

const DeleteTransaction = async (userId, transactionId) => {
    const query = `
    DELETE FROM transacoes AS t
    USING contasBancarias AS c 
    WHERE t.id_contabancaria = c.id
    AND c.id_usuario = $1
    AND t.id = $2
    `;
    await pool.query(query, [userId, transactionId])
}

const ListTransactions = async (id) => {
    const { rows, rowCount } = await pool.query("SELECT * FROM user_transactions WHERE user_id = $1", [id]);
    return { rows, total: rowCount, firstResult: rows[0] };

}
module.exports = { checkValidAccount, CreateTransaction, ReadTransaction, UpdateTransaction, DeleteTransaction, ListTransactions };