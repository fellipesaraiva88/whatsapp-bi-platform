import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getPipeline: () => api.get('/dashboard/pipeline'),
};

export const contactsAPI = {
  list: (params) => api.get('/contacts', { params }),
  get: (jid) => api.get(`/contacts/${jid}`),
  update: (jid, data) => api.put(`/contacts/${jid}`, data),
};

export const messagesAPI = {
  list: (chatJid, limit = 50) => api.get(`/messages/${chatJid}`, { params: { limit } }),
  search: (query, filters) => api.post('/messages/search', { query, filters }),
};

export const aiAPI = {
  analyze: (contactJid) => api.post(`/ai/analyze/${contactJid}`),
  suggest: (contactJid) => api.post(`/ai/suggest/${contactJid}`),
  sendMessage: (data) => api.post('/ai/send-message', data),
};

export const syncAPI = {
  contacts: () => api.post('/sync/contacts'),
  messages: (chatJid, limit) => api.post(`/sync/messages/${chatJid}`, { limit }),
  autoPipeline: (limit) => api.post('/sync/auto-pipeline', { limit }),
};

export const whatsappAPI = {
  listChats: (limit = 20) => api.get('/whatsapp/chats', { params: { limit } }),
  sendMessage: (recipient, message) => api.post('/whatsapp/send', { recipient, message }),
};

export const interactionsAPI = {
  list: (contactJid, limit = 50) => api.get(`/interactions/${contactJid}`, { params: { limit } }),
};

export const realtimeAPI = {
  start: () => api.post('/realtime/start'),
  stop: () => api.post('/realtime/stop'),
};

export default api;