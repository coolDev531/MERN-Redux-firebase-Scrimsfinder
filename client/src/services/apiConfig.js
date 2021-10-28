import axios from 'axios';

const apiUrls = {
  production: process.env.REACT_APP_API_URL,
  development: 'http://localhost:3000/api',
};

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? apiUrls.production
    : apiUrls.development;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'x-api-key': process.env.REACT_APP_API_KEY,
  },
});

export default api;
