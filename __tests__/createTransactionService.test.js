const { calcularProximaOcorrencia } = require("../utils/calcularOcorrencia");

jest.mock('../utils/calcularOcorrencia', () => ({
    calcularProximaOcorrencia: jest.fn()
}));

const { CreateTransactionService } = require('../services/transactionService');
const transactionModel = require('../models/transactionModel');

// MOCK dos métodos usados no model
jest.mock('../models/transactionModel', () => ({
    checkValidAccount: jest.fn(),
    CreateTransaction: jest.fn()
}));

jest.mock('../utils/calcularOcorrencia', () => ({
    calcularProximaOcorrencia: jest.fn()
}));

describe('CreateTransactionService - Recorrência', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve calcular a próxima ocorrência quando natureza é Fixa', async () => {
        const mockProximaData = new Date('2025-06-02');
        calcularProximaOcorrencia.mockReturnValue(mockProximaData);

        transactionModel.checkValidAccount.mockResolvedValue(true);
        transactionModel.CreateTransaction.mockResolvedValue();

        const dados = {
            id_contabancaria: 1,
            categoria: 'Aluguel',
            tipo: 'Despesa',
            valor: 1000,
            natureza: 'Fixa',
            data_transacao: new Date('2025-05-02'),
            frequencia_recorrencia: 'Mensal'
        };

        await CreateTransactionService(dados, 123); // userId = 123

        expect(calcularProximaOcorrencia).toHaveBeenCalledWith(
            dados.data_transacao,
            dados.frequencia_recorrencia
        );

        expect(transactionModel.CreateTransaction).toHaveBeenCalledWith(
            dados.id_contabancaria,
            dados.categoria,
            dados.tipo,
            -1000, // valor transformado
            dados.data_transacao,
            dados.natureza,
            true, // recorrente
            dados.frequencia_recorrencia,
            mockProximaData // deve ser igual ao mock retornado
        );
    });
});
