// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';  // Import global styles
import App from './App.jsx';  // Your main app component
import { PrimeReactProvider } from 'primereact/api';  // PrimeReact provider for configuration
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // PrimeReact theme (you can change this to any theme)
import 'primereact/resources/primereact.min.css';  // Core styles for PrimeReact
import 'primeicons/primeicons.css';  // Icons for PrimeReact
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpfcHRXR2NcUkd2W0ZWYUA=');

// Create the root element and render the app
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
