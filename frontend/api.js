import axios from 'axios';

const API_BASE_URL = 'http://localhost:1234/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

export async function createUser(username, password) {
  const response = await apiClient.post('/user/create', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
}

export async function login(username, password) {
  const response = await apiClient.post('/login', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
}

export async function updateUser(username = null, password = null) {
  const data = {};
  if (username) data.username = username;
  if (password) data.password = password;
  const response = await apiClient.post('/user/update', data);
  return response.data;
}

export async function deleteUser() {
  const response = await apiClient.post('/user/delete');
  localStorage.removeItem('token');
  return response.data;
}

export async function getUsers() {
  const response = await apiClient.get('/users');
  return response.data.users; // array
}

export async function addScore(score) {
  const response = await apiClient.post('/score', { score });
  return response.data;
}

export async function getScores(userId) {
  const response = await apiClient.get(`/${userId}/score`);
  return response.data.scores; // array
}

// 🚪 Déconnexion (juste local)
export function logout() {
  localStorage.removeItem('token');
}
