import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LeagueProvider } from './contexts/LeagueContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <LeagueProvider>
      <App />
    </LeagueProvider>
  </AuthProvider>
);
