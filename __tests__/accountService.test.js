const {
    CreateAccountService,
    ListAccountService,
    ListAccountByIDService,
    RemoveAccountService,
    ListTransactionsService
} = require('../services/accountService');
const pool = require('../db.js');

const accountModel = require('../models/accountModel');

jest.mock('../models/accountModel', () => ({
    checkValidAccount: jest.fn(),
    CreateAccount: jest.fn(),
    FindAccountByID: jest.fn(),
    UpdateAccount: jest.fn(),
    DeleteAccount: jest.fn(),
    ListAllAccounts: jest.fn(),
    ListTransactionsByAccount: jest.fn(),
    AccountExists: jest.fn(),
}));

describe('CreateAccountService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar uma conta válida', async () => {
        const mockDados = {
            data_criacao: new Date(),
            nome_conta: 'Conta banco 1',
            saldo: 200.00,
            icone: 'account_balance',
            desc_conta: 'Conta corrente',
            tipo_conta: 'Conta corrente'
        };
        const userId = 123;

        accountModel.AccountExists.mockResolvedValue(false);

        await expect(CreateAccountService(mockDados, userId)).resolves.toBeUndefined();

        expect(accountModel.AccountExists).toHaveBeenCalledWith(mockDados.nome_conta, userId);
        expect(accountModel.CreateAccount).toHaveBeenCalled();
    });


    it('deve lançar erro se faltar um campo', async () => {
        const mockDados = {
            data_criacao: new Date(),
            nome_conta: 'Conta banco 1',
            saldo: 200.00,
            icone: 'account_balance',
            desc_conta: 'Conta corrente',
            // tipo_conta: 'Conta corrente'
        };
        const userId = 123;

        await expect(CreateAccountService(mockDados, userId))
            .rejects
            .toThrow(`Campos obrigatórios faltando: tipo_conta`);
    });

    it('deve lançar erro se criar uma conta ja existente', async () => {
        const mockDados = {
            data_criacao: new Date(),
            nome_conta: 'Conta banco 1',
            saldo: 200.00,
            icone: 'account_balance',
            desc_conta: 'Conta corrente',
            tipo_conta: 'Conta corrente'
        };
        const userId = 123;

        accountModel.AccountExists.mockResolvedValue(true);

        await expect(CreateAccountService(mockDados, userId))
            .rejects
            .toThrow('Já existe uma conta com este nome');
    });

})

describe('ListAccountService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar todas as contas do usuário', async () => {
        const AccountMock = {
            rows: [
                {
                    data_criacao: new Date(),
                    nome_conta: 'Conta banco 1',
                    saldo: 200.00,
                    icone: 'account_balance',
                    desc_conta: 'Conta corrente',
                    tipo_conta: 'Conta corrente'
                },
                {
                    data_criacao: new Date(),
                    nome_conta: 'Conta banco 2',
                    saldo: 300.00,
                    icone: 'account_balance',
                    desc_conta: 'Conta poupança',
                    tipo_conta: 'Conta poupança'
                },
            ],
        };
        accountModel.ListAllAccounts.mockResolvedValue(AccountMock);
        const userId = 123;
        const mockLimit = 10;
        const mockOffset = 0;
        const result = await ListAccountService(userId, mockLimit, mockOffset);
        expect(accountModel.ListAllAccounts).toHaveBeenCalledWith(userId, mockLimit, mockOffset);
        expect(result).toEqual(AccountMock.rows);
    });

    it('deve lançar erro caso não retorne nenhuma conta', async () => {
        const mockAccountID = 1;
        const mockUserID = 123;

        accountModel.ListAllAccounts.mockResolvedValue({ rows: [] });

        await expect(ListAccountService(mockAccountID, mockUserID))
            .rejects
            .toThrow('Nenhuma conta encontrada');
    });
})

describe('RemoveAccountService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve remover a conta com o id inserido', async () => {
        const mockAccountID = 1;
        const mockUserID = 123;

        accountModel.FindAccountByID.mockResolvedValue({ total: 1 });
        accountModel.DeleteAccount.mockResolvedValue(true);

        await RemoveAccountService(mockUserID, mockAccountID);

        expect(accountModel.FindAccountByID).toHaveBeenCalledWith(mockAccountID, mockUserID);
        expect(accountModel.DeleteAccount).toHaveBeenCalledWith(mockAccountID, mockUserID);
    });

    it('deve lançar erro se não encontrar a conta pelo id', async () => {
        const mockAccountID = 1;
        const mockUserID = 123;

        accountModel.FindAccountByID.mockResolvedValue({ total: 0 });

        await expect(RemoveAccountService(mockUserID, mockAccountID))
            .rejects
            .toThrow('Conta não encontrada');
    });

})

describe('ListAccountByIDService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('deve retornar a conta com o id inserido', async () => {
        const AccountMock = {
            rows: [
                {
                    data_criacao: new Date(),
                    nome_conta: 'Conta banco 1',
                    saldo: 200.00,
                    icone: 'account_balance',
                    desc_conta: 'Conta corrente',
                    tipo_conta: 'Conta corrente'
                },
            ],
        };
        accountModel.FindAccountByID.mockResolvedValue(AccountMock);
        const accountId = 1;
        const userId = 123;
        const result = await ListAccountByIDService(userId, accountId);
        expect(accountModel.FindAccountByID).toHaveBeenCalledWith(userId, accountId);
        expect(result).toEqual(AccountMock.rows);
    });


    it('deve lançar erro se não encontrar a conta pelo id', async () => {
        const mockAccountID = 1;
        const mockUserID = 123;

        accountModel.FindAccountByID.mockResolvedValue({ rows: [] });

        await expect(ListAccountByIDService(mockAccountID, mockUserID))
            .rejects
            .toThrow('Conta não encontrada');
    });

})

describe('ListTransactionByAccount', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('deve retornar a transação pelo id da conta inserida', async () => {
        const AccountMock = {
            rows: [
                {
                    nome_conta: "Conta Investimentos Banco A",
                    categoria: "Lazer",
                    tipo: "Despesa",
                    valor: "459.6500",
                    data_transacao: "2025-01-02T03:30:00.000Z"
                },
            ],
        };
        accountModel.ListTransactionsByAccount.mockResolvedValue(AccountMock);
        const accountId = 1;
        const userId = 123;
        const result = await ListTransactionsService(userId, accountId);
        expect(accountModel.ListTransactionsByAccount).toHaveBeenCalledWith(userId, accountId);
        expect(result).toEqual(AccountMock.rows);
    });

    it('deve lançar um erro caso não encontre nenhuma transação na conta', async () => {
        const mockAccountID = 21;
        const mockUserID = 6;

        accountModel.ListTransactionsByAccount.mockResolvedValue({ rows: [] });
        await expect(ListTransactionsService(mockAccountID, mockUserID))
            .rejects
            .toThrow('Não foi encontrada nenhuma transação para essa conta');
    });


    afterAll(async () => {
        await pool.end();
    });

})

