require('dotenv').config();
const cron = require('node-cron');
const pool = require('../db.js')
const { format } = require('date-fns');

async function processarTransacoesRecorrentes() {
    const hoje = format(new Date(), 'yyyy/MM/dd HH:mm:ss');

    const query = `
    SELECT * FROM transacoes
    WHERE recorrente = true AND proxima_ocorrencia <= $1
  `;
    const { rows } = await pool.query(query, [hoje]);

    for (const transacoes of rows) {
        const {
            id,
            id_contabancaria,
            categoria,
            tipo,
            valor,
            frequencia_recorrencia,
            natureza,
            proxima_ocorrencia,
        } = transacoes;

        const novaData = new Date();

        await pool.query(
            `INSERT INTO transacoes 
        (id_contabancaria, valor, categoria, tipo, data_transacao, natureza)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [id_contabancaria, valor, categoria, tipo, novaData, natureza]
        );

        let proxima = new Date(proxima_ocorrencia);
        switch (frequencia_recorrencia) {
            case 'Diario': proxima.setDate(proxima.getDate() + 1); break;
            case 'Semanal': proxima.setDate(proxima.getDate() + 7); break;
            case 'Quinzenal': proxima.setDate(proxima.getDate() + 14); break;
            case 'Mensal': proxima.setMonth(proxima.getMonth() + 1); break;
            case 'Bimestral': proxima.setMonth(proxima.getMonth() + 2); break;
            case 'Trimestral': proxima.setMonth(proxima.getMonth() + 3); break;
            case 'Quadrimestral': proxima.setMonth(proxima.getMonth() + 4); break;
            case 'Semestral': proxima.setMonth(proxima.getMonth() + 6); break;
            case 'Anual': proxima.setFullYear(proxima.getFullYear() + 1); break;
        }

        await pool.query(
            `UPDATE transacoes SET proxima_ocorrencia = $1 WHERE id = $2`,
            [proxima, id]
        );

        console.log(`Transação recorrente processada para conta ${id_contabancaria}. Próxima em ${proxima.toISOString().slice(0, 10)}`);
    }
}

async function processarMetasVencimento() {
    const hoje = format(new Date(), 'yyyy/MM/dd HH:mm:ss');

    const query = `
    SELECT * FROM metas
    WHERE status_meta = 'ativa' AND deadline <= $1
  `;
    const { rows } = await pool.query(query, [hoje]);
    for (const metas of rows) {
        const {
            id,
            id_usuario
        } = metas
        await pool.query(
            `UPDATE metas
            SET status_meta = 'expirada'
            WHERE id = $1`,
            [id]
        );
        console.log(`Meta de id ${id} do usuario ${id_usuario} expirou. Marcando como expirada`);
    }
}

function iniciarCron() {
    cron.schedule('0 0 * * *', async () => {
        console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Verificando transações recorrentes...`);
        console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] Verificando metas expiradas...`);
        await Promise.all([
            processarTransacoesRecorrentes(),
            processarMetasVencimento()
        ]);
    });
}

module.exports = {
    processarTransacoesRecorrentes,
    iniciarCron
};