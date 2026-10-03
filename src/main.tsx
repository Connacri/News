import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/offlineCache';

// Initialiser le Service Worker pour le cache hors-ligne
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
