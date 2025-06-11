import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Used to navigate to edit page

/**
 * Component: ProjectList
 * Description: Displays a list of project cards, each expandable/collapsible to show details.
 * Allows multiple projects to be expanded at once using a Set to track expanded IDs.
 *
 * @param {Array} projects - List of project objects with id, title, description, and tags
 * @param {Function} handleDelete - Callback to delete a project by ID
 */
function ProjectList({ projects, handleDelete }) {
  // Track the set of currently expanded project IDs.
  // Multiple projects can be expanded at once.
  const [expandedIds, setExpandedIds] = useState(new Set());

  /**
   * toggleExpand
   * Toggles the expanded/collapsed state of a project.
   * Adds or removes the project's ID from the expandedIds Set.
   *
   * @param {number|string} id - Project ID to toggle
   */
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Collapse
      } else {
        newSet.add(id); // Expand
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.id} className="bg-gray-700 p-4 rounded shadow">
          {/* Project title header with expand/collapse toggle */}
          <h3
            onClick={() => toggleExpand(p.id)}
            className="text-xl font-bold text-blue-400 cursor-pointer hover:underline flex justify-between items-center"
          >
            {p.title}
            <span className="text-lg text-blue-300 ml-2">{expandedIds.has(p.id) ? '−' : '+'}</span>
          </h3>

          {/* Show details if this project is expanded */}
          {expandedIds.has(p.id) && (
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
                  to={`/edit/${p.id}`} 
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
