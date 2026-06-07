import api from './axios';

export const analyzeExpensesApi       = (data) => api.post('/ai/analyze', data);
export const getBudgetAdviceApi       = (data) => api.post('/ai/advice', data);
export const categorizeTransactionApi = (data) => api.post('/ai/categorize', data);