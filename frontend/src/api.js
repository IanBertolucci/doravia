import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

export const getCities = () => api.get('/cities').then((r) => r.data);
export const getCity = (id) => api.get(`/cities/${id}`).then((r) => r.data);
export const createCity = (name) => api.post('/cities', { name }).then((r) => r.data);
export const updateCity = (id, name) => api.put(`/cities/${id}`, { name }).then((r) => r.data);
export const deleteCity = (id) => api.delete(`/cities/${id}`);
export const reorderCities = (cityIds) => api.patch('/cities/reorder', { cityIds });

export const getDay = (id) => api.get(`/days/${id}`).then((r) => r.data);
export const getDays = (cityId) => api.get(`/cities/${cityId}/days`).then((r) => r.data);
export const createDay = (cityId, label, date, sunset) =>
  api.post(`/cities/${cityId}/days`, { label, date, sunset }).then((r) => r.data);
export const updateDay = (id, label, date, sunset) =>
  api.put(`/days/${id}`, { label, date, sunset }).then((r) => r.data);
export const deleteDay = (id) => api.delete(`/days/${id}`);
export const reorderDays = (cityId, dayIds) =>
  api.patch(`/cities/${cityId}/days/reorder`, { dayIds });

export const getActivities = (dayId) =>
  api.get(`/days/${dayId}/activities`).then((r) => r.data);
export const getActivity = (id) => api.get(`/activities/${id}`).then((r) => r.data);
export const createActivity = (dayId, activity) =>
  api.post(`/days/${dayId}/activities`, activity).then((r) => r.data);
export const updateActivity = (id, activity) =>
  api.put(`/activities/${id}`, activity).then((r) => r.data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
export const reorderActivities = (dayId, activityIds) =>
  api.patch(`/days/${dayId}/activities/reorder`, { activityIds });
export const togglePurchased = (id) => api.patch(`/activities/${id}/purchased`);

export const getContacts = () => api.get('/contacts').then((r) => r.data);
export const createContact = (data) => api.post('/contacts', data).then((r) => r.data);
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data).then((r) => r.data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);
export const reorderContacts = (contactIds) => api.patch('/contacts/reorder', { contactIds });

export const getBackups = () => api.get('/backups').then((r) => r.data);
export const createBackup = () => api.post('/backups').then((r) => r.data);

export default api;
