import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getTransactionsApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from '../api/transactions';
import { Key } from 'lucide-react';

export default function useTransactions(params = {}) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactionsApi(params).then((r) => r.data),
  });

  console.log('TRANSACTIONS DATA', data);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['transactions'], exact: false });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const create = useMutation({
    mutationFn: createTransactionApi,

    onMutate: async (newTransaction) => {
      await qc.cancelQueries({ queryKey: ['transactions'] });

      const previousQueries = qc.getQueriesData({
        queryKey: ['transactions'],
      });

      qc.setQueriesData(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;

          const optimisticTx = {
            ...newTransaction,
            _id: `temp-${Date.now()}`,
            category:
            typeof newTransaction.category === 'string' ? { _id: newTransaction.category } : newTransaction.category,
            createdAt: new Date().toISOString(),
          };

          return {
            ...old,
            transactions: [
              optimisticTx,
              ...(old.transactions || []),
            ],
            pagination: {
              ...old.pagination,
              total: (old.pagination?.total || 0) + 1,
            },
          };
        }
      );

      return { previousQueries };
    },

    onError: (err, variables, context) => {
      context?.previousQueries?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });

      toast.error(err.response?.data?.message || 'Ошибка');
    },

    onSuccess: () => { toast.success('Транзакция добавлена'); },

    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ['transactions'],
        exact: false,
      });

      qc.invalidateQueries({
        queryKey: ['stats'],
        exact: false,
      });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateTransactionApi(id, data),
    onSuccess: () => { toast.success('Транзакция обновлена'); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const remove = useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: () => { toast.success('Транзакция удалена'); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  return {
    transactions: data?.transactions || [],
    pagination: data?.pagination || {},
    isLoading,
    create,
    update,
    remove,
  };
}