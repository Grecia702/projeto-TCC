
const {
    CreateTransactionService,
    ListTransactionsService,
    RemoveTransactionService,
    getTransactionByID }
    = require('../services/transactionService');
const transactionModel = require('../models/transactionModel');

jest.mock('../models/transactionModel', () => ({
    checkValidAccount: jest.fn(),
    CreateTransaction: jest.fn(),
    ListTransactions: jest.fn(),
    ReadTransaction: jest.fn(),
    DeleteTransaction: jest.fn()
}));

describe('CreateTransactionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar uma transação válida', async () => {
        const mockDados = {
            id_contabancaria: 1,
            categoria: 'Salário',
            tipo: 'Receita',
            valor: 1000,
            data_transacao: new Date(),
            natureza: 'variavel',
        };
        const userId = 123;

        transactionModel.checkValidAccount.mockResolvedValue(true);

        await expect(CreateTransactionService(mockDados, userId)).resolves.toBeUndefined();

        expect(transactionModel.checkValidAccount).toHaveBeenCalledWith(1, 123);
        expect(transactionModel.CreateTransaction).toHaveBeenCalled();
    });

    it('deve lançar erro se algum campo obrigatório estiver faltando', async () => {
        const mockDados = {
            categoria: 'Aluguel',
            tipo: 'Despesa',
            valor: 1000,
            natureza: 'fixa',
        };
        const userId = 123;

        await expect(CreateTransactionService(mockDados, userId))
            .rejects
            .toThrow('Campos obrigatórios faltando: id_contabancaria, data_transacao');
    });

    it('deve lançar erro se a conta for inválida', async () => {
        const mockDados = {
            id_contabancaria: 1,
            categoria: 'Aluguel',
            tipo: 'Despesa',
            valor: 500,
            data_transacao: new Date(),
            natureza: 'variavel',
        };
        const userId = 123;

        transactionModel.checkValidAccount.mockResolvedValue(false);

        await expect(CreateTransactionService(mockDados, userId))
            .rejects
            .toThrow('Conta inválida');
    });
});


describe('ListTransactionsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar as transações corretamente', async () => {
        const mockUserId = 123;
        const mockTransacoes = {
            rows: [
                { id: 1, categoria: 'Salário', tipo: 'Receita', valor: 1000 },
                { id: 2, categoria: 'Aluguel', tipo: 'Despesa', valor: -500 },
            ],
        };
        transactionModel.ListTransactions.mockResolvedValue(mockTransacoes);

        const result = await ListTransactionsService(mockUserId);
        expect(transactionModel.ListTransactions).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual(mockTransacoes.rows);
    });

    it('deve lançar um erro se ocorrer um problema ao listar as transações', async () => {
        const mockUserId = 123;
        transactionModel.ListTransactions.mockRejectedValue(new Error('Erro ao listar transações'));

        await expect(ListTransactionsService(mockUserId))
            .rejects
            .toThrow('Erro ao listar transações');
    });
});

describe('GetTransactionByID', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Deve retornar a transação requisitada individualmente', async () => {
        const mockUserId = 123;
        const mockTransactionID = 1;
        const mockTransaction = {
            rows: [
                { id: 1, categoria: 'Salário', tipo: 'Receita', valor: 1000 },
            ],
        };
        transactionModel.ReadTransaction.mockResolvedValue(mockTransaction);
        const result = await getTransactionByID(mockUserId, mockTransactionID);
        expect(transactionModel.ReadTransaction).toHaveBeenCalledWith(mockUserId, mockTransactionID);
        expect(result).toEqual(mockTransaction.rows);
    })

    it('deve lançar um erro se a ID for invalida', async () => {
        const mockUserId = 123;
        const mockTransactionID = 1;
        transactionModel.ReadTransaction.mockRejectedValue(new Error('Erro ao listar transação'));

        await expect(getTransactionByID(mockUserId, mockTransactionID))
            .rejects
            .toThrow('Erro ao listar transação');
    });

    it('deve lançar erro se nenhuma transação for encontrada', async () => {
        const mockUserId = 123;
        const mockTransactionID = 999;
        transactionModel.ReadTransaction.mockResolvedValue({ rows: [] });

        await expect(getTransactionByID(mockUserId, mockTransactionID))
            .rejects
            .toThrow('Nenhuma transação com essa ID foi encontrada');
    });
})

describe('DeleteTransactionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('deve deletar a transação se ela existir', async () => {
        const mockUserId = 1;
        const mockTransactionId = 10;
        const mockTransaction = {
            rows: [
                { id: 10, valor: 100, categoria: 'Exemplo' }
            ],
        };

        transactionModel.ReadTransaction.mockResolvedValue(mockTransaction);
        await RemoveTransactionService(mockUserId, mockTransactionId);

        expect(transactionModel.ReadTransaction).toHaveBeenCalledWith(mockUserId, mockTransactionId);
        expect(transactionModel.DeleteTransaction).toHaveBeenCalledWith(mockUserId, mockTransactionId);
    });

    it('deve lançar erro se a transação não for encontrada', async () => {
        const mockUserId = 1;
        const mockTransactionId = 999;

        transactionModel.ReadTransaction.mockResolvedValue({ rows: [] });

        await expect(
            RemoveTransactionService(mockUserId, mockTransactionId)
        ).rejects.toThrow('Nenhuma transação com essa ID foi encontrada');

        expect(transactionModel.DeleteTransaction).not.toHaveBeenCalled();
    });

    it('deve propagar erros do banco de dados', async () => {
        const mockUserId = 1;
        const mockTransactionId = 10;

        transactionModel.ReadTransaction.mockRejectedValue(new Error('Erro no banco'));

        await expect(
            RemoveTransactionService(mockUserId, mockTransactionId)
        ).rejects.toThrow('Erro no banco');
    });
})