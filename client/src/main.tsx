import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

import { ThemeProvider } from "./context/ThemeContext";

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
  console.warn(
    '%c[GoogleOAuth] VITE_GOOGLE_CLIENT_ID is not set in client/.env.\n' +
    'Google Login will not work until you add it.\n' +
    'Server DEV MOCK MODE is active on the backend (pass an email as idToken to /auth/google-verify).',
    'color: #ff9800; font-weight: bold;'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <BookingProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </BookingProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
