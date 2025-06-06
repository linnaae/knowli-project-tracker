import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ← Add this

function ProjectList({ projects, handleDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.id} className="bg-gray-700 p-4 rounded shadow">
          <h3
            onClick={() => toggleExpand(p.id)}
            className="text-xl font-bold text-blue-400 cursor-pointer hover:underline flex justify-between items-center"
          >
            {p.title}
            <span className="text-lg text-blue-300 ml-2">{expandedId === p.id ? '−' : '+'}</span>
          </h3>

          {expandedId === p.id && (
            <>
              <p className="text-gray-300 mt-2">{p.description}</p>
              {p.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-4">
                <Link
                  to={`/edit/${p.id}`} // ← This is the key line
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
