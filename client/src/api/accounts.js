import api from 'axios';

export const getAccountsApi      = ()     => api.get('/accounts');
export const getInvitesApi       = ()     => api.get('/accounts/invites');
export const createAccountApi    = (data) => api.post('/accounts', data);
export const acceptInviteApi     = (id)   => api.post(`/accounts/${id}/accept`); 
export const declineInviteApi    = (id)   => api.post(`/accounts/${id}/decline`);
export const leaveAccountApi     = (id)   => api.delete(`/accounts/${id}/leave`);
export const deleteAccountApi    = (id)   => api.delete(`/accounts/${id}`);
export const getAccountStatsApi  = (id)   => api.get(`/accounts/${id}/stats`);