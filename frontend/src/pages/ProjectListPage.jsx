import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectList from '../components/ProjectList';
import FilterSidebar from '../components/FilterSidebar';
import tagOptions from '../constants/tagOptions.json';

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [matchModes, setMatchModes] = useState(() => {
  const initialModes = {};
  Object.keys(tagOptions).forEach(cat => {
    initialModes[cat] = "any"; // default mode
  });
  return initialModes;
});


useEffect(() => {
  const params = new URLSearchParams();

  if (searchTerm.trim()) {
    params.append('q', searchTerm.trim());
  }

  for (const [category, values] of Object.entries(filters)) {
    if (Array.isArray(values)) {
      values.forEach(val => params.append(category, val));
      params.append(`${category}_match`, matchModes[category] || "any");
    }
  }

  const url = `http://localhost:5000/api/projects?${params.toString()}`;

  fetch(url)
    .then(res => res.json())
    .then(data => setProjects(data));
}, [searchTerm, filters, matchModes]);



  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } else {
      alert('Failed to delete project');
    }
  };

  const clearSearch = () => setSearchTerm('');
  const clearFilters = () => {
    setFilters({});
    setMatchModes(() => {
      const resetModes = {};
      Object.keys(tagOptions).forEach(cat => {
        resetModes[cat] = "any";
      });
      return resetModes;
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">Knowli Project Tracker</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-1/4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full p-2 rounded bg-white text-black placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-400 mt-1 hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>

            {Object.keys(filters).length > 0 && (
              <div className="text-sm text-gray-400 mt-3 mb-4">
                <strong className="text-gray-300">Active Filters:</strong>{' '}
                {Object.entries(filters).map(([category, values]) =>
                  values.map(tag => (
                    <span key={`${category}-${tag}`} className="inline-block mr-2">
                      <span className="bg-blue-600 px-2 py-0.5 rounded text-white text-xs">
                        {tag}
                      </span>
                    </span>
                  ))
                )}
              </div>
            )}

            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              matchModes={matchModes}
              setMatchModes={setMatchModes}
              clearFilters={clearFilters}
            />
          </div>

          {/* Main content */}
          <div className="w-3/4 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
              <Link
                to="/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                + New Project
              </Link>
            </div>

            <hr className="border-gray-700" />

            <ProjectList
              projects={projects.map(p => ({
                ...p,
                tags: Object.values(p.tags || {}).flat(),
              }))}
              handleDelete={handleDelete}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectListPage;
