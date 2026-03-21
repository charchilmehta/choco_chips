import API from './api';

export const register = (data) => API.post('/auth/register', data);

export const login = (data) => API.post('/auth/login', data);

export const getMe = () => API.get('/auth/me');

export const sendOtp = (phone) => API.post('/auth/send-otp', { phone });

export const verifyOtp = (otp) => API.post('/auth/verify-otp', { otp });
