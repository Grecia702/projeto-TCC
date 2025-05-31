import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@context/axiosInstance';
import { useAuth } from '@context/authContext';

export const BudgetContext = createContext();


const getBudget = async () => {
    const res = await api.get('/budget/activated');
    return res.data;
};

const createBudget = async (budgetData) => {
    const res = await api.post('/budget', budgetData);
    return res.data;
};

const updateBudget = async ({ id, ...data }) => {
    const res = await api.patch(`/budget/${id}`, data);
    return res.data;
};

const deleteBudget = async (id) => {
    const res = await api.delete(`/budget/${id}`);
    return res.data;
};

export const BudgetProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const { data: budgetData, isLoading: isBudgetLoading, refetch: refetchBudget } = useQuery({
        queryKey: ['budget_id'],
        queryFn: getBudget,
        enabled: isAuthenticated,
        staleTime: 1 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: false,
        retry: false,
        onSuccess: (response) => {
            console.log('Dados agrupados no onSuccess:', response.data);
        },
        onError: (error) => {
            console.log('Erro na requisição de dados agrupados:', error);
        }
    });


    const createBudgetMutation = useMutation({
        mutationFn: createBudget,
    });

    const updateBudgetMutation = useMutation({
        mutationFn: updateBudget,
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: deleteBudget,
        onSuccess: async () => {
            await queryClient.invalidateQueries(['budget_id']);
        },
        onError: (error) => console.log(error)
    });

    return (
        <BudgetContext.Provider value={{
            budgetData,
            isBudgetLoading,
            refetchBudget,
            createBudgetMutation,
            updateBudgetMutation,
            deleteBudgetMutation,
        }}>
            {children}
        </BudgetContext.Provider>
    );

}

export const useBudgetAuth = () => {
    return useContext(BudgetContext)
};
