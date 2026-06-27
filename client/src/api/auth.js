import api from './axios';

export const registerApi           = (data) => api.post('/auth/register', data);
export const loginApi              = (data) => api.post('/auth/login', data);
export const getMeApi              = ()     => api.get('/auth/me');
export const updateProfileApi      = (data) => api.put('/auth/profile', data);
export const changePasswordApi     = (data) => api.put('/auth/password', data);
export const completeOnboardingApi = ()     => api.post('/auth/onboarding-complete');