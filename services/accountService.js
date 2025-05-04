const { error } = require("winston");
const accountModel = require("../models/accountModel");

const validarCamposObrigatorios = (dados) => {
    const camposObrigatorios = ['nome_conta', 'saldo', 'tipo_conta', 'icone'];
    const camposFaltando = camposObrigatorios.filter(campo => !dados[campo]);

    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }
};

const CreateAccountService = async (dados, userId) => {

    validarCamposObrigatorios(dados);
    if (typeof dados.saldo !== 'number') {
        throw new Error('O campo saldo deve ser um número')
    }

    const ContaValida = await accountModel.AccountExists(dados.nome_conta, userId)
    if (ContaValida) {
        throw new Error('Já existe uma conta com este nome')
    }
    await accountModel.CreateAccount(userId, dados.nome_conta, dados.data_criacao, dados.saldo, dados.tipo_conta, dados.icone, dados.desc_conta);
}

const RemoveAccountService = async (userId, id) => {
    const account = await accountModel.FindAccountByID(id, userId)
    const ContaExiste = account.total > 0

    if (ContaExiste) {
        await accountModel.DeleteAccount(id, userId)
        console.log("Conta Excluída: ", id)
        return true
    }
    else {
        throw new Error('Conta não encontrada')
    }
}

const ListAccountService = async (userId, limit, offset) => {
    const account = await accountModel.ListAllAccounts(userId, limit, offset);
    if (!account.rows || account.rows.length === 0) {
        throw new Error('Nenhuma conta encontrada');
    }
    return account.rows
}

const ListAccountByIDService = async (AccountId, userId) => {
    const account = await accountModel.FindAccountByID(AccountId, userId);
    if (!account.rows || account.rows.length === 0) {
        throw new Error('Conta não encontrada');
    }
    return account.rows;
};

const ListTransactionsService = async (AccountId, userId) => {
    const account = await accountModel.ListTransactionsByAccount(AccountId, userId);
    if (!account.rows || account.rows.length === 0) {
        throw new Error('Não foi encontrada nenhuma transação para essa conta');
    }
    return account.rows;
}
module.exports = { CreateAccountService, ListAccountService, RemoveAccountService, ListAccountByIDService, ListAccountByIDService, ListTransactionsService };