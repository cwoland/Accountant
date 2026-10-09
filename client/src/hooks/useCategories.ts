import { useQuery } from '@tanstack/react-query';
import type { CategoryDto } from '@accountant/shared';
import { getCategoriesApi } from '../api/endpoints';

export function useCategories() {
  const { data, isPending } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategoriesApi().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const all: CategoryDto[] = data ?? [];
  return {
    all,
    isPending,
    income: all.filter((c) => c.type === 'income' || c.type === 'both'),
    expense: all.filter((c) => c.type === 'expense' || c.type === 'both'),
    mandatory: all.filter((c) => c.isMandatory),
    byId: new Map(all.map((c) => [c._id, c])),
  };
}