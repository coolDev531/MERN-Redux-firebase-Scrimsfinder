import axios from 'axios';

let apiUrl;

const apiUrls = {
  production: process.env.REACT_APP_API_URL,
  development: 'http://localhost:3000/api',
};

if (window.location.hostname === 'localhost') {
  apiUrl = apiUrls.development;
} else {
  apiUrl = apiUrls.production;
}

const api = axios.create({
  baseURL: apiUrl,
});

export default api;
