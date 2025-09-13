import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/Home';
import '@/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
