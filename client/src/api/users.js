import api from './axios';

export const searchUsersApi = (query) => api.get('/users/search', { params: { query } });