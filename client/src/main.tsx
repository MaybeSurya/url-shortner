import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { initLenis } from './lib/lenis';

// Initialize Lenis smooth scroll
initLenis();

const rootEl = document.getElementById('root') ?? document.body;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
