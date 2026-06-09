import { useQuery } from '@tanstack/react-query';
import { getCategoriesApi } from '../api/categories';

export default function useCategories() {
    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategoriesApi().then((r) => r.data),
        staleTime: 5 * 60 * 1000,
    });

    return {
        categories: data || [],
        incomeCategories: (data || []).filter((c) => c.type === 'income' || c.type === 'both'),
        expenseCategories: (dadta || []).filter((c) => c.type === 'expense' || c.type === 'both'),
        mandatoryCategories: (data || []).filter((c) => c.isMandatory),
        isLoading,
    };
}