import axios from 'axios';
import queryString from 'query-string';

const axiosService = axios.create({
  baseURL: 'http://118.70.155.34:8000',
  timeout: 10000,
  paramsSerializer: params => queryString.stringify(params),
});

axiosService.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  config.headers = {
    ...config.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
  config.data = {
    ...config.data,
  };
  return config;
});

axiosService.interceptors.response.use(
  response => {
    if (response.data && response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return Promise.reject({
      status: response.status,
      message: response.data?.message || 'Unknown error',
    });
  },
  error => {
    console.error('Response error:', error);
    let errorMessage = 'An error occurred';
    let status = 500;
    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error';
      status = error.response.status;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    } else {
      errorMessage = error.message;
    }
    return Promise.reject({
      status: status,
      message: errorMessage,
    });
  },
);

export default axiosService;
