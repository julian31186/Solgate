import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './views/home/App';
import Dashboard from './views/dashboard/Dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dash" element={<Dashboard />} />

    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
