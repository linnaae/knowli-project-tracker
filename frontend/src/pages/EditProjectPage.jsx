import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';

function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/projects/${id}`)
      .then(res => res.json())
      .then(data => setInitialData(data))
      .catch(err => console.error('Failed to load project:', err));
  }, [id]);

  const handleSubmit = async (payload) => {
    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  };

  if (!initialData) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <Link to="/" className="text-blue-400 hover:underline">
            ← Back to Projects
          </Link>
        </div>

        <ProjectForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default EditProjectPage;
