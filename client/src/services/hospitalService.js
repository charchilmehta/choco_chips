import API from './api';

export const registerHospital = (data) =>
  API.post('/hospitals/register', data);

export const getHospitals = (params) =>
  API.get('/hospitals', { params });

export const getHospitalById = (id) => API.get(`/hospitals/${id}`);

export const searchHospitals = (query) =>
  API.get('/hospitals/search', { params: { q: query } });
