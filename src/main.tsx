import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthRedirectCatcher from './components/AuthRedirectCatcher'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthRedirectCatcher />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
