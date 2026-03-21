import API from './api';

export const createRecord = (data) => API.post('/medical/records', data);

export const getPatientRecords = (patientUserId) =>
  API.get(`/medical/records?patientUserId=${patientUserId}`);

export const getRecord = (id) => API.get(`/medical/records/${id}`);

export const addPrescription = (id, data) =>
  API.post(`/medical/records/${id}/prescription`, data);

export const downloadPrescription = (id) =>
  API.get(`/medical/records/${id}/prescription/download`, {
    responseType: 'blob',
  });
