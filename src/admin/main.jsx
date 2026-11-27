import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp.jsx';
import { AuthProvider } from '../auth/AuthContext';
import '../index.css';
import './admin.css';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  </React.StrictMode>
);
