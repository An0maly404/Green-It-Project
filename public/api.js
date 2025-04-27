import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm';

// const API_BASE_URL = 'https://green-it-backend.vercel.app/api';
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
  // localStorage.setItem('token', response.data.token);
  // localStorage.setItem('username', username); 
  return response.data;
}

export async function login(username, password) {
  const response = await apiClient.post('/login', { username, password });
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('username', username); 
  return response.data;
}

export function logoutUser() {
  localStorage.clear();
  window.location.href = 'main_login.html';
}


export async function updateUser(username = null, password = null, userId = 0) {
  const data = {};
  if (username) data.username = username;
  if (password) data.password = password;
  if (userId) data.user_id = userId;
  const response = await apiClient.post('/user/update', data);
  return response.data;
}

export async function deleteUser(user_id) {
  if (user_id === 1) return

  const data = {};
  if (user_id) data.user_id = user_id;
  const response = await apiClient.post('/user/delete', data);

  // localStorage.removeItem('token');

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

export function getToken() {
  return localStorage.getItem('token');
}

export function parseJwt (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
    const json      = decodeURIComponent(
      base64.split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// const PORT = process.env.PORT || 1234;
// app.listen(PORT, () => {
//     console.log(`Listening on port ${PORT}`);
// });