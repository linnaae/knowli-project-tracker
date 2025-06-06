import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectListPage from './pages/ProjectListPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/create" element={<CreateProjectPage />} />
        <Route path="/edit/:id" element={<EditProjectPage />} />
      </Routes>
    </Router>
  );
}

export default App;
