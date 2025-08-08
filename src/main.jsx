// src/main.jsx
import './Liscence.jsx'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';  // Import global styles
import App from './App.jsx';  // Your main app component

// Create the root element and render the app
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
      <App />
  </StrictMode>
);
