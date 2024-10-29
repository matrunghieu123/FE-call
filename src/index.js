import React from 'react';
import ReactDOM from 'react-dom/client'; // Cập nhật import
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Sử dụng createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

