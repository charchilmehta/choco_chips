import API from './api';

export const createRedButtonEmergency = (location) =>
  API.post('/emergency/red-button', { location });

export const validateEmergency = (data) =>
  API.post('/emergency/validate', data);

export const createFromValidation = (data) =>
  API.post('/emergency/create-from-validation', data);

export const triggerFailSafe = (data) =>
  API.post('/emergency/fail-safe', data);
