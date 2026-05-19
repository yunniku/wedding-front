import axios from 'axios';

const api = axios.create({
    baseURL: 'https://wedding-backend-ips9.onrender.com/api',
});

// 회원 API
export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);

// 청첩장 API
export const createWedding = (data, userId) => api.post(`/weddings?userId=${userId}`, data);
export const getWeddings = () => api.get('/weddings');
export const getWeddingByCode = (code) => api.get(`/weddings/share/${code}`);
export const updateWedding = (id, data) => api.put(`/weddings/${id}`, data);
export const deleteWedding = (id) => api.delete(`/weddings/${id}`);

// 방명록 API
export const writeGuestbook = (weddingId, data) => api.post(`/guestbooks/${weddingId}`, data);
export const getGuestbooks = (weddingId) => api.get(`/guestbooks/${weddingId}`);
export const deleteGuestbook = (id) => api.delete(`/guestbooks/${id}`);