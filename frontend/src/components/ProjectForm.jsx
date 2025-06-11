// src/components/ProjectForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tagOptions from '../constants/tagOptions.json';


/**
 * Component: ProjectForm
 * Description: Form for creating or editing a project.
 * Supports title, description, tag selection by category, and freeform tags.
 *
 * Props:
 * - initialData (object): Optional initial values (used in edit mode)
 * - onSubmit (function): Callback to handle form submission, returns true/false
 */
function ProjectForm({ initialData = {}, onSubmit }) {
  const navigate = useNavigate();

  // State for project fields
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');

  // selectedTags: { client: [], technology: [], ... , extra: [] }
  const [selectedTags, setSelectedTags] = useState({});
  const [extraTags, setExtraTags] = useState('');

  /**
   * useEffect: On load (or when initialData.tags changes), group tags by category.
   * Tags not found in tagOptions are treated as "extra" (freeform).
   */
  useEffect(() => {
    if (initialData.tags) {
      const grouped = {};
      initialData.tags.forEach(tag => {
        // Try to categorize tag
        for (const [cat, values] of Object.entries(tagOptions)) {
          if (values.includes(tag)) {
            grouped[cat] = [...(grouped[cat] || []), tag];
            return;
          }
        }
        // If not in tagOptions, treat as extra
        grouped.extra = [...(grouped.extra || []), tag];
      });
      setSelectedTags(grouped);
      setExtraTags((grouped.extra || []).join(', '));
    }
  }, [initialData]);

  /**
   * handleCheckboxChange
   * Toggles a tag within its category.
   *
   * @param {string} category - Tag category
   * @param {string} value - Tag value
   */
  const handleCheckboxChange = (category, value) => {
    const current = selectedTags[category] || [];
    setSelectedTags({
      ...selectedTags,
      [category]: current.includes(value)
        ? current.filter(t => t !== value) // Uncheck
        : [...current, value]              // Check
    });
  };

  /**
   * handleSubmit
   * Gathers all selected tags (structured + freeform),
   * calls onSubmit callback, and navigates home if successful.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTags = [];

    // Collect tags from structured categories
    for (const [cat, values] of Object.entries(selectedTags)) {
      if (cat !== 'extra') allTags.push(...values);
    }

    // Append freeform tags (split by comma, trimmed)
    for (const val of extraTags.split(',').map(t => t.trim()).filter(Boolean)) {
      allTags.push(val);
    }

    const payload = { title, description, tags: allTags };
    const ok = onSubmit ? await onSubmit(payload) : true;
    
    if (ok) navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded shadow mt-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-white">Project Title:</label>
        <input
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Description:</label>
        <textarea
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {Object.entries(tagOptions).map(([category, values]) => (
        <div key={category}>
          <h3 className="text-white font-semibold capitalize mb-1">{category.replace('_', ' ')}</h3>
          <div className="flex flex-wrap gap-4">
            {values.map(value => (
              <label key={value} className="flex items-center gap-1 text-white">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-500"
                  checked={selectedTags[category]?.includes(value) || false}
                  onChange={() => handleCheckboxChange(category, value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-white">Additional Tags (comma-separated):</label>
        <input
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          value={extraTags}
          onChange={(e) => setExtraTags(e.target.value)}
        />
      </div>

      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}

export default ProjectForm;
