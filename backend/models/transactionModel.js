require('dotenv').config();
const pool = require('../db.js')

const checkValidAccount = async (accountId, userId) => {
  const query = `
    SELECT 1 
    FROM contasBancarias 
    WHERE id = $1 AND id_usuario = $2
  `;
  const { rowCount } = await pool.query(query, [accountId, userId]);
  return rowCount > 0;
}

const CreateTransaction = async (id_contabancaria, nome_transacao, categoria, data_transacao, tipo, valor, natureza, recorrente, frequencia_recorrencia, proxima_ocorrencia, budget_id) => {
  const query = `
    INSERT INTO transacoes 
    (id_contabancaria, nome_transacao, categoria, data_transacao, tipo, valor, natureza , recorrente, frequencia_recorrencia, proxima_ocorrencia, budget_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
  await pool.query(query, [id_contabancaria, nome_transacao, categoria, data_transacao, tipo, valor, natureza, recorrente, frequencia_recorrencia, proxima_ocorrencia, budget_id]);
}

const CreateManyTransactions = async (transactions) => {
  const values = [];
  const placeholders = transactions.map((transaction, i) => {
    const idx = i * 11;
    values.push(
      transaction.id_contabancaria,
      transaction.nome_transacao,
      transaction.categoria,
      transaction.data_transacao,
      transaction.tipo,
      transaction.valor,
      transaction.natureza,
      transaction.recorrente,
      transaction.frequencia_recorrencia,
      transaction.proxima_ocorrencia,
      transaction.budget_id,
    );

    return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11})`;
  }).join(', ');

  const query = `
    INSERT INTO transacoes 
    (id_contabancaria, nome_transacao, categoria, data_transacao, tipo, valor, natureza , recorrente, frequencia_recorrencia, proxima_ocorrencia, budget_id)   
    VALUES ${placeholders}
    RETURNING categoria, nome_transacao, tipo, valor, data_transacao;
  `;

  const { rows, rowCount } = await pool.query(query, values);
  return { rows, rowCount }
};

const ReadTransaction = async (userId, transactionId) => {
  const { rows, rowCount } = await pool.query("SELECT * FROM user_transactions WHERE user_id = $1 AND transaction_id = $2 ", [userId, transactionId]);
  return { rows, exists: rowCount > 0, total: rowCount, result: rows[0] };
}

const UpdateTransaction = async (userId, transaction_id, queryParams) => {
  const keys = Object.keys(queryParams);
  if (keys.length === 0) {
    throw new Error('Nenhum campo para atualizar');
  }
  const values = Object.values(queryParams);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const params = [...values, userId, transaction_id]
  const query = `
    UPDATE transacoes AS t
    SET ${setClause}, updated_at = NOW()
    FROM contasBancarias AS cb
    WHERE t.id_contabancaria = cb.id
    AND cb.id_usuario = $${keys.length + 1}
    AND t.id = $${keys.length + 2}
    `;
  await pool.query(query, params)
}

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

const ListTransactions = async (userId, queryParams) => {
  const { tipo, natureza, limit, offset, orderBy, orderDirection } = queryParams
  let orderParam = orderBy
  if (orderBy === 'valor') {
    orderParam = 'ABS(valor)'
  }
  const query = `
    SELECT 
    transaction_id,
    conta,
    nome_transacao,
    categoria,
    valor,
    data_transacao, 
    tipo, 
    natureza,
    recorrente, 
    frequencia_recorrencia, 
    proxima_ocorrencia
    FROM user_transactions 
    WHERE user_id = $1
      AND ($2::text IS NULL OR tipo = $2::text)
      AND ($3::text IS NULL OR natureza = $3::text)
    ORDER BY ${orderParam} ${orderDirection}, transaction_id ASC
    LIMIT $4
    OFFSET $5
  `;
  const { rows, rowCount } = await pool.query(query, [userId, tipo, natureza, limit, offset]);
  return { rows, total: rowCount, firstResult: rows[0] };
}

const listSumTransactions = async (userId) => {
  const query = `
SELECT
  COALESCE(tipo, 'Total') AS tipo,
  SUM(valor) AS total
FROM user_transactions
WHERE user_id = $1
  AND tipo IN ('receita', 'despesa')
GROUP BY GROUPING SETS ((tipo), ())

`;
  const { rows, rowCount } = await pool.query(query, [userId]);
  return { rows, total: rowCount, firstResult: rows[0] };
}

const countTransactionsResult = async (userId, queryParams) => {
  const { tipo, natureza } = queryParams
  const query = `
    SELECT COUNT(*) FROM user_transactions 
    WHERE user_id = $1
      AND ($2::text IS NULL OR tipo = $2::text)
      AND ($3::text IS NULL OR natureza = $3::text)
    `;
  const { rows } = await pool.query(query, [userId, tipo, natureza]);
  return parseInt(rows[0].count)
}

const GroupTransactionsByType = async (userId) => {
  const query = `
    SELECT 
    COALESCE(tipo, 'Total') AS tipo,
    COALESCE(natureza, 'Total') AS natureza,
    COUNT(*) AS ocorrencias,
    SUM(valor) AS valor
    FROM user_transactions
    WHERE user_id = $1
    AND tipo IN ('receita', 'despesa')
    GROUP BY GROUPING SETS (
    (tipo, natureza), 
    (tipo),            
    ()                 
    )`;
  const { rows, rowCount } = await pool.query(query, [userId]);
  return { rows, total: rowCount, firstResult: rows[0] };
}

const GroupTransactionsByCategories = async (userId, first_date, last_date) => {
  const query = `
    SELECT 
    categoria, 
    COUNT(*) AS ocorrencias, 
    SUM(valor) AS total
    FROM user_transactions
    WHERE user_id = $1
    AND tipo = 'despesa'
    AND categoria IN ('Lazer', 'Transporte', 'Educação', 'Alimentação', 'Internet', 'Contas', 'Compras', 'Outros', 'Saúde')
    AND data_transacao BETWEEN $2 AND $3
    GROUP BY categoria
`;
  const { rows, rowCount } = await pool.query(query, [userId, first_date, last_date]);
  return { rows, total: rowCount, result: rows[0] };
}

const transactionSummary = async (first_day, last_day, interval, userId) => {
  const query = `
WITH periodo AS (
  SELECT 
    generate_series(
      $1, 
      $2, 
      ('1 ' || $3)::interval
    ) AS date_interval
  ),
periodo_numerado AS (
  SELECT date_interval, ROW_NUMBER() OVER () AS periodo_num FROM periodo
),
tipos(tipo) AS (
  VALUES ('receita'), ('despesa')
)
SELECT 
  p.date_interval AS date_interval,
  p.periodo_num AS name_interval,
  t.tipo,
  COUNT(ut.user_id) AS ocorrencias,
  COALESCE(SUM(ut.valor), 0) AS valor
FROM periodo_numerado p
CROSS JOIN tipos t
LEFT JOIN user_transactions ut 
  ON ut.data_transacao >= p.date_interval
  AND ut.data_transacao < p.date_interval + ('1 ' || $3)::interval
  AND ut.user_id = $4
  AND ut.tipo = t.tipo
  AND ut.data_transacao BETWEEN $1 AND $2
GROUP BY p.periodo_num, p.date_interval, t.tipo
ORDER BY p.periodo_num, t.tipo
`;
  const { rows, rowCount } = await pool.query(query, [first_day, last_day, interval, userId]);
  return { rows, total: rowCount, firstResult: rows[0] };
}

const transactionSummaryTotal = async (first_day, last_day, userId) => {
  const query = `
  WITH periodo AS (
  SELECT 
    generate_series(
      date_trunc('month'::text, $1::date), 
      date_trunc('month'::text, $2::date), 
    ('1 ' || 'month')::interval
    ) AS date_interval
  ),
  periodo_numerado AS (
    SELECT date_interval, ROW_NUMBER() OVER () AS periodo_num FROM periodo
  ),
  tipos(tipo) AS (
    VALUES ('receita'), ('despesa')
  )
  SELECT 
    TO_CHAR(p.date_interval, 'mon') AS date_interval,
    t.tipo,
    COALESCE(SUM(ut.valor), 0) AS valor
  FROM periodo_numerado p
  CROSS JOIN tipos t
  LEFT JOIN user_transactions ut 
    ON DATE_TRUNC('month'::text, ut.data_transacao) = p.date_interval
    AND ut.user_id = $3
    AND ut.tipo = t.tipo
  GROUP BY p.periodo_num, p.date_interval, t.tipo
  ORDER BY p.periodo_num, t.tipo
  `;
  const { rows, rowCount } = await pool.query(query, [first_day, last_day, userId]);
  return { rows, total: rowCount, result: rows };
}

const getFirstTransaction = async (userId) => {
  const query = `
    SELECT data_transacao 
    FROM user_transactions 
    WHERE user_id = $1 
    ORDER BY data_transacao ASC
    LIMIT 1
    `;
  const { rows, rowCount } = await pool.query(query, [userId]);
  return { rows, total: rowCount, result: rows[0] };
}

module.exports = {
  checkValidAccount,
  CreateTransaction,
  CreateManyTransactions,
  ReadTransaction,
  UpdateTransaction,
  DeleteTransaction,
  ListTransactions,
  listSumTransactions,
  countTransactionsResult,
  GroupTransactionsByType,
  GroupTransactionsByCategories,
  transactionSummary,
  transactionSummaryTotal,
  getFirstTransaction,
};