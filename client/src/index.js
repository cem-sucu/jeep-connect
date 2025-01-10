import React from 'react';
import ReactDOM from 'react-dom/client'; // Assure-toi d'importer depuis 'react-dom/client'

import App from './App';

// Création d'un root à partir de l'élément DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Utilisation root.render() pour rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
