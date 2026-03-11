import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AuthProvider from './context/AuthContext'
import ErrorProvider from './context/ErrorContext';
import darkTheme from './theme.js';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
    <ErrorProvider>
      <AuthProvider>
      <App />
      </AuthProvider>
          </ErrorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
