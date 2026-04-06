import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EvalForm from './pages/EvalForm';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EvalForm />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
