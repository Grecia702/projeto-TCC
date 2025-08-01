import React, { createContext, useContext } from 'react';
import api from './axiosInstance';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@context/authContext';
import { useContasAuth } from '@context/contaContext';

export const TransactionContext = createContext();

const createTransaction = async (transactionData) => {
    try {
        await api.post('/profile/transaction/', transactionData);
        return
    } catch (error) {
        throw error
    }
};

const updateTransaction = async ({ id, ...transactionData }) => {
    await api.patch(`/profile/transaction/${id}`, transactionData);
    return
};

const deleteTransaction = async (id) => {
    try {
        await api.delete(`/profile/transaction/${id}`);
        return
    } catch (error) {
        throw error
    }
};


export const TransactionProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const getInfinityTransaction = async ({ pageParam = 1, queryKey }) => {
        const [, filters = {}] = queryKey;

        const response = await api.get('/profile/transaction', {
            params: {
                ...(filters.natureza && { natureza: filters.natureza }),
                ...(filters.categoria && { categoria: filters.categoria }),
                ...(filters.data_transacao && { data_transacao: filters.data_transacao }),
                ...(filters.valor_menor_que && { valor_menor_que: filters.valor_menor_que }),
                ...(filters.valor_maior_que && { valor_maior_que: filters.valor_maior_que }),
                tipo: filters.tipo,
                orderBy: filters.orderBy,
                orderDirection: filters.orderDirection,
                page: pageParam,
                limit: 10
            },
        });

        const { data, meta } = response.data;
        return { data, meta };
    };


    const useFilteredTransacoes = (serializedFilters, filters = {}) => {
        return useInfiniteQuery({
            queryKey: ['transacoes_infinite', filters],
            queryFn: ({ pageParam = 1, queryKey }) => getInfinityTransaction({ pageParam, queryKey }),
            initialPageParam: 1,
            enabled: isAuthenticated,
            getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage?.meta?.page + 1 : undefined,
        });
    };


    const createTransactionMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget_id'] });
            queryClient.invalidateQueries({ queryKey: ['transacoes_infinite'] });
            queryClient.invalidateQueries({ queryKey: ['categories_posts'] });
        }
    });

    const updateTransactionMutation = useMutation({
        mutationFn: updateTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget_id'] });
            queryClient.invalidateQueries({ queryKey: ['transacoes_infinite'] });
            queryClient.invalidateQueries({ queryKey: ['categories_posts'] });
        }
    });

    const deleteTransactionMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budget_id'] });
            queryClient.invalidateQueries({ queryKey: ['transacoes_infinite'] });
            queryClient.invalidateQueries({ queryKey: ['categories_posts'] });
        }
    });

    return (
        <TransactionContext.Provider value={{
            useFilteredTransacoes,
            createTransactionMutation,
            updateTransactionMutation,
            deleteTransactionMutation,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};


export const useTransactionAuth = () => {
    return useContext(TransactionContext)
};
