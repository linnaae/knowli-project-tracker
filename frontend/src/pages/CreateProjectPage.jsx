// CreateProjectPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';

function CreateProjectPage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const res = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Add New Project</h1>
          <Link to="/" className="text-blue-400 hover:underline">
            ← Back to Projects
          </Link>
        </div>
        <ProjectForm onSubmit={handleCreate} />
      </div>
    </div>
  );
}

export default CreateProjectPage;
