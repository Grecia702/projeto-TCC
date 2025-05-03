const transactionModel = require("../models/transactionModel");
const {
    CreateTransactionService,
    ListTransactionsService,
    getTransactionByID,
    RemoveTransactionService
} = require("../services/transactionService")
const moment = require('moment');


const AddTransaction = async (req, res) => {
    try {
        const { userId } = req.user.decoded
        const dados = req.body
        await CreateTransactionService(dados, userId);

        return res.status(200).json({ message: 'Transação criada com sucesso' });
    } catch (error) {
        console.error('Erro na criação da transação:', error.message);

        if (error.message.includes('Campos obrigatórios faltando')) {
            return res.status(400).json({
                message: 'Campos obrigatórios em branco',
                campos_faltando: error.message.split(': ')[1]
            });
        }
        if (error.message === 'Valor da receita tem que ser maior ou diferente de 0 ') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Valor da despesa tem que ser maior ou diferente de 0 ') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Transações fixas devem ter frequência definida') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Conta inválida') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const ReadTransaction = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user.decoded
        const transacoes = await getTransactionByID(userId, id);
        res.json(transacoes);
    }
    catch (error) {
        // console.error('Erro ao listar transação:', error.message);
        if (error.message === 'Nenhuma transação com essa ID foi encontrada') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao conectar com o banco de dados', error: error.message })
    }
}

const RemoveTransaction = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user.decoded
        await RemoveTransactionService(userId, id)
        return res.sendStatus(204);
    }
    catch (error) {
        if (error.message === 'Nenhuma transação com essa ID foi encontrada') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao conectar com o banco de dados', error: error.message })
    }
}
const UpdateTransaction = async (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    try {
        if (Object.keys(campos).length === 0 || !id) {
            return res.status(400).json({ erro: 'Nenhum campo fornecido' });
        }

        transactionModel.UpdateTransaction(id, campos);
        return res.status(200).json({ message: 'Transação atualizada com sucesso' })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao conectar com o banco de dados', error: error.message })
    }
}

const ListarTransactions = async (req, res) => {
    try {
        const { userId } = req.user.decoded
        const transacoes = await ListTransactionsService(userId);
        res.json(transacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao conectar com o banco de dados', error: error.message })
    }
};
module.exports = { AddTransaction, ReadTransaction, RemoveTransaction, ListarTransactions, UpdateTransaction };