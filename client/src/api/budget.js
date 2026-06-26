import api from './axios';

export const getBudgetApi = (params) => api.get('/budget', { params });
export const setBudgetApi = (data) => api.post('/budget', data);