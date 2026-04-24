import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BookingProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BookingProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
