import API from './api';

export const bookAppointment = (data) => API.post('/appointments/book', data);

export const getAppointments = () => API.get('/appointments');

export const getAppointmentById = (id) => API.get(`/appointments/${id}`);

export const updateStatus = (id, status) =>
  API.patch(`/appointments/${id}/status`, { status });

export const getSlots = (doctorId, date) =>
  API.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`);

export const getDoctors = (params) =>
  API.get('/appointments/doctors', { params });
