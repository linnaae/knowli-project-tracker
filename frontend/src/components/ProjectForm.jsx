// src/components/ProjectForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tagOptions from '../constants/tagOptions.json';

function ProjectForm({ initialData = {}, onSubmit }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [selectedTags, setSelectedTags] = useState({});
  const [extraTags, setExtraTags] = useState('');

  useEffect(() => {
    if (initialData.tags) {
      const grouped = {};
      initialData.tags.forEach(tag => {
        for (const [cat, values] of Object.entries(tagOptions)) {
          if (values.includes(tag)) {
            grouped[cat] = [...(grouped[cat] || []), tag];
            return;
          }
        }
        grouped.extra = [...(grouped.extra || []), tag];
      });
      setSelectedTags(grouped);
      setExtraTags((grouped.extra || []).join(', '));
    }
  }, [initialData]);

  const handleCheckboxChange = (category, value) => {
    const current = selectedTags[category] || [];
    setSelectedTags({
      ...selectedTags,
      [category]: current.includes(value)
        ? current.filter(t => t !== value)
        : [...current, value]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTags = [];

    for (const [cat, values] of Object.entries(selectedTags)) {
      if (cat !== 'extra') allTags.push(...values);
    }

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
