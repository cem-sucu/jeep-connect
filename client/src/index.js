import React from 'react';
import ReactDOM from 'react-dom/client'; // Assure-toi d'importer depuis 'react-dom/client'

import App from './App';

// Crée un root à partir de l'élément DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Utilise root.render() pour rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
