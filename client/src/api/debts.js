import api from './axios';

export const getDebtsApi     = ()          => api.get('/debts');
export const createDebtApi   = (data)      => api.post('/debts', data);
export const addPaymentApi   = (id, data)  => api.post(`/debts/${id}/payment`, data);
export const deleteDebtApi   = (id)        => api.delete(`/debts/${id}`);