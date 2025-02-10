import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  const reportWebVitals = (onPerfEntry: any) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    }
  };
  
  reportWebVitals(console.log);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
