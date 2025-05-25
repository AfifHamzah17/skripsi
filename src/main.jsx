// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';       // Tailwind
import './style.css';       // Styles untuk halaman login/register
import { Toaster } from 'sonner'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Toaster position="top-right" richColors expand={true} />
    <App />
  </React.StrictMode>
);