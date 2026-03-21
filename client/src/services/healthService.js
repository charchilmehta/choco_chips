import API from './api';

export const logMetrics = (data) => API.post('/health/metrics', data);

export const getHistory = () => API.get('/health/metrics/history');
