import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1200', color: '#FFF8F0', border: '1px solid #D4A853' },
          success: { iconTheme: { primary: '#D4A853', secondary: '#0D0A00' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 4000
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)


