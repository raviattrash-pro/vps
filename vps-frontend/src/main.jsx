import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './AuthContext.jsx'
import { API_BASE_URL } from './config';

// Global Fetch Interceptor for Auth
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
    const token = localStorage.getItem('vps_token');
    if (token && url.toString().includes(API_BASE_URL)) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
