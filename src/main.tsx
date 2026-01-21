import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer';
import './index.css'

// Polyfill Buffer for the browser (required by @react-pdf/renderer)
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
