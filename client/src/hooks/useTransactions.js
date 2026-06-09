import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getTransactionsApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from '../api/transactions';

export default function useTransactions(params = {}) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactionsApi(params).then((r) => r.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['transactions'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const create = useMutation({
    mutationFn: createTransactionApi,
    onSuccess: () => { toast.success('Транзакция добавлена'); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
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