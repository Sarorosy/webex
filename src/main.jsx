// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';  // Import global styles
import App from './App.jsx';  // Your main app component
import { PrimeReactProvider } from 'primereact/api';  // PrimeReact provider for configuration
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // PrimeReact theme (you can change this to any theme)
import 'primereact/resources/primereact.min.css';  // Core styles for PrimeReact
import 'primeicons/primeicons.css';  // Icons for PrimeReact

// Create the root element and render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
