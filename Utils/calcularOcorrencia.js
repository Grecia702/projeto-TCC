const calcularProximaOcorrencia = (dataTransacao, frequenciaRecorrencia) => {
    let proxima = new Date(dataTransacao);

    switch (frequenciaRecorrencia) {
        case 'Diario':
            proxima.setDate(proxima.getDate() + 1);
            break;
        case 'Semanal':
            proxima.setDate(proxima.getDate() + 7);
            break;
        case 'Quinzenal':
            proxima.setDate(proxima.getDate() + 14);
            break;
        case 'Mensal':
            proxima.setMonth(proxima.getMonth() + 1);
            break;
        case 'Bimestral':
            proxima.setMonth(proxima.getMonth() + 2);
            break;
        case 'Trimestral':
            proxima.setMonth(proxima.getMonth() + 3);
            break;
        case 'Quadrimestral':
            proxima.setMonth(proxima.getMonth() + 4);
            break;
        case 'Semestral':
            proxima.setMonth(proxima.getMonth() + 6);
            break;
        case 'Anual':
            proxima.setFullYear(proxima.getFullYear() + 1);
            break;
        default:
            throw new Error('Frequência de recorrência inválida');
    }

    return proxima;
};

module.exports = { calcularProximaOcorrencia };
