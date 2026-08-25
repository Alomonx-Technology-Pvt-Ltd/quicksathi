import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Backend wake-up — fires BEFORE React mounts ───────────────────────────────
// This gives Render's free-tier backend the maximum warm-up time while the JS
// bundle is still parsing. By the time user interacts, the server is ready.
const apiBase = import.meta.env.VITE_API_URL || '';
if (apiBase && !apiBase.includes('localhost')) {
  const backendRoot = apiBase.replace('/api', '');
  fetch(`${backendRoot}/api/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
