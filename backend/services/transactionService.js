
const transactionModel = require("../models/transactionModel");
const budgetModel = require("../models/budgetModel");
const { calcularProximaOcorrencia } = require("../Utils/calcularOcorrencia")
const { z } = require('zod');
const { startOfMonth, subDays, subMonths, endOfMonth } = require('date-fns');

const transactionQuerySchema = z.object({
    id_contabancaria: z.number().int().optional(),
    tipo: z.string().optional().nullable()
        .transform(val => val?.toLowerCase())
        .refine(val => !val || ['despesa', 'receita'].includes(val), {
            message: "tipo inválido"
        }),
    natureza: z.string().min(1).optional(),
    nome_transacao: z.string().optional(),
    categoria: z.string().min(1).optional(),
    valor: z.number().positive().optional(),
    recorrente: z.boolean().optional(),
    frequencia_recorrencia: z.string().optional(),
    proxima_ocorrencia: z.string().optional(),
    budget_id: z.number().int().optional(),
    data_transacao: z.string().datetime().optional(),
    orderBy: z.enum(['valor', 'data_transacao', 'tipo', 'natureza', 'transaction_id']).default('transaction_id'),
    orderDirection: z.enum(['ASC', 'DESC']).default('DESC'),
    limit: z.coerce.number().int().min(1).max(100).default(15),
    page: z.coerce.number().int().min(0).default(1),
    period: z.enum(['week', 'month', 'day', 'year']).default('week')
});

const transactionCreateSchema = z.union([
    transactionQuerySchema,
    z.array(transactionQuerySchema).nonempty()
]);

const validarCamposObrigatorios = (dados) => {
    const camposObrigatorios = ['id_contabancaria', 'categoria', 'tipo', 'valor', 'natureza'];
    const camposFaltando = camposObrigatorios.filter(campo => !dados[campo]);

    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }
};


const validarFrequenciaRecorrencia = (frequencia) => {
    const frequenciasValidas = ['Diario', 'Semanal', 'Quinzenal', 'Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Quadrimestral', 'Anual'];
    if (frequenciasValidas.indexOf(frequencia) === -1) {
        throw new Error('Frequência de recorrência inválida. As opções válidas são: diário, semanal, quinzenal, mensal, anual.');
    }
};


const CreateTransactionService = async (dados, userId) => {

    validarCamposObrigatorios(dados);
    if (dados.valor <= 0) {
        throw new Error('Valor da transação tem que ser maior ou diferente de 0 ');
    }
    if (dados.tipo === 'Despesa' || dados.tipo === 'despesa') {
        dados.valor = -Math.abs(dados.valor)
    }

    if (dados.natureza === 'Fixa') {
        dados.recorrente = true;

        if (!dados.frequencia_recorrencia) {
            throw new Error('Transações fixas devem ter frequência definida');
        }
        validarFrequenciaRecorrencia(dados.frequencia_recorrencia);

        dados.proxima_ocorrencia = calcularProximaOcorrencia(dados.data_transacao, dados.frequencia_recorrencia);
    }
    else {
        dados.recorrente = false
        dados.frequencia_recorrencia = null
        dados.proxima_ocorrencia = null
    }


    const contaValida = await transactionModel.checkValidAccount(dados.id_contabancaria, userId);

    if (!contaValida) throw new Error('Conta inválida');

    const { result, exists } = await budgetModel.checkValidDate(dados.data_transacao, userId)

    let budget_id = null;
    if (exists) {
        budget_id = result.id
    }

    await transactionModel.CreateTransaction(
        dados.id_contabancaria,
        dados.nome_transacao,
        dados.categoria,
        dados.data_transacao,
        dados.tipo,
        dados.valor,
        dados.natureza,
        dados.recorrente,
        dados.frequencia_recorrencia,
        dados.proxima_ocorrencia,
        budget_id,
    );
};

const CreateManyTransactionService = async (transactions, userId) => {

    const parsed = transactionCreateSchema.parse(transactions);
    const transactionsArray = Array.isArray(parsed) ? parsed : [parsed];
    const updatedTransactions = [];

    for (const transaction of transactionsArray) {
        if (transaction.tipo === 'despesa') {
            transaction.valor = -Math.abs(transaction.valor);
        }

        const contaValida = await transactionModel.checkValidAccount(transaction.id_contabancaria, userId);

        if (!contaValida) throw new Error('Conta inválida');

        updatedTransactions.push(transaction);
    }
    const manyTransactions = await transactionModel.CreateManyTransactions(updatedTransactions, userId);
    console.log(manyTransactions.rows)
};

const getTransactionByID = async (userId, transactionId) => {
    const transacoes = await transactionModel.ReadTransaction(userId, transactionId);
    if (transacoes.rows.length === 0) {
        throw new Error('Nenhuma transação com essa ID foi encontrada');
    }

    const data = {
        ...transacoes.result,
        valor: parseFloat(transacoes.result.valor)
    }

    return data;
};

const RemoveTransactionService = async (userId, transactionId) => {
    const transactions = await transactionModel.ReadTransaction(userId, transactionId);

    if (!transactions.exists) {
        throw new Error('Transação não encontrada');
    }

    await transactionModel.DeleteTransaction(userId, transactionId)
}

const UpdateTransactionService = async (userId, transaction_id, queryParams) => {
    let { valor } = queryParams;
    const { result } = await transactionModel.ReadTransaction(userId, transaction_id)
    if (valor !== undefined) {
        valor = result.tipo === 'despesa' && result.valor > 0 ? -Math.abs(Number(valor)) : Math.abs(Number(valor));
    }

    await transactionModel.UpdateTransaction(userId, transaction_id, {
        ...queryParams,
        ...(valor !== undefined && { valor })
    });
}

const ListTransactionsService = async (userId, query) => {
    const { page, limit, orderBy, orderDirection, ...rest } = transactionQuerySchema.parse(query);
    const offset = (page - 1) * limit;
    const queryParams = { orderBy, orderDirection, page, limit, offset, ...rest };
    const [transacoes, total] = await Promise.all([
        transactionModel.ListTransactions(userId, queryParams),
        transactionModel.countTransactionsResult(userId, queryParams)
    ])

    const transactionData = transacoes.rows.map((item) => ({
        ...item,
        valor: Math.abs(parseFloat((item.valor)))
    }))

    return {
        data: transactionData,
        meta: {
            total: total,
            page: page,
            limit: limit,
            hasNextPage: offset + limit < total,
        },
    };
};

const GroupTransactionService = async (userId) => {
    try {
        const transacoes = await transactionModel.GroupTransactionsByType(userId);
        if (transacoes.total === 0) {
            throw new Error('Nenhuma transação foi encontrada');
        }
        const data = transacoes.rows.map(row => ({
            tipo: row.tipo,
            natureza: row.natureza,
            ocorrencias: Number(row.ocorrencias),
            valor: Math.abs(parseFloat(row.valor))
        }));
        return data;
    } catch (error) {
        throw error;
    }

};

const GroupCategoriesService = async (userId, query) => {
    const { first_date, last_date } = query
    const transacoes = await transactionModel.GroupTransactionsByCategories(userId, first_date, last_date);
    const data = transacoes.rows.map(row => ({
        ...row,
        ocorrencias: parseInt(row.ocorrencias),
        total: Math.abs(row.total)
    }));
    return data;
};


const transactionSummaryService = async (userId, query) => {
    const { period, all } = transactionQuerySchema.parse(query);
    const { first_day, last_day } = query

    const transactions = await transactionModel.transactionSummary(first_day, last_day, period, userId)
    if (transactions.total === 0) {
        throw new Error('Nenhuma transação encontrada');
    }
    const data = transactions.rows.map(row => ({
        ...row,
        valor: Math.abs(row.valor),
    }));

    const [actualMonthTotal, lastMonthTotal] = await Promise.all([
        transactionModel.transactionSummaryTotal(first_day, last_day, userId),
        transactionModel.transactionSummaryTotal(
            startOfMonth(subMonths(first_day, 1)),
            endOfMonth(subMonths(first_day, 1)),
            userId
        )
    ]);

    const actualMonthResult = actualMonthTotal.result.reduce((acc, item) => {
        acc[item.tipo] = Math.abs(Number(item.valor));
        return acc;
    }, { despesa: 0, receita: 0 });

    const lastMonthResult = lastMonthTotal.result.reduce((acc, item) => {
        acc[item.tipo] = Math.abs(Number(item.valor));
        return acc;
    }, { despesa: 0, receita: 0 });

    const variacao = {
        despesa: (((actualMonthResult.despesa - lastMonthResult.despesa) / lastMonthResult.despesa) * 100).toFixed(2),
        receita: (((actualMonthResult.receita - lastMonthResult.receita) / lastMonthResult.receita) * 100).toFixed(2)
    }

    if (period === 'week') {
        const groupedData = data.reduce((acc, item) => {
            const week = `S${item.name_interval}`;
            const tipo = item.tipo;
            const valor = item.valor;
            if (!acc[week]) {
                acc[week] = { despesa: 0, receita: 0, date_interval: item.date_interval };
            }
            acc[week][tipo] += valor;

            return acc;
        }, {});

        const chartData = Object.entries(groupedData).map(([week, values]) => ({
            week,
            date_interval: values.date_interval,
            despesa: values.despesa,
            receita: values.receita,
        }))
        return {
            data: chartData,
            total: actualMonthResult,
            percent: variacao
        }
    }
    return data
};



module.exports = {
    CreateTransactionService,
    CreateManyTransactionService,
    ListTransactionsService,
    UpdateTransactionService,
    RemoveTransactionService,
    getTransactionByID,
    GroupTransactionService,
    GroupCategoriesService,
    transactionSummaryService
};