import { api } from '../api/client';

export interface ExportParams {
  accountId?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

export async function downloadTransactionsCsv(params: ExportParams = {}): Promise<void> {
  const { data } = await api.get<Blob>('/export/csv', { params, responseType: 'blob' });

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `accountant-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
