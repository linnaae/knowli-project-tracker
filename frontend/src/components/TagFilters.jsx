import React, { useState } from 'react';

const tagOptions = {
  client: ['DCF', 'AHCA', 'DEP', 'CMS'],
  domain: ['health', 'environment', 'fraud', 'finance', 'education'],
  technology: ['SQL', 'Alteryx', 'Power BI', 'Tableau', 'Python', 'Flask', 'React', 'machine learning'],
  project_type: ['dashboard', 'automation', 'analysis', 'nlp', 'scraping']
};

function TagFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({});

  const handleCheckboxChange = (category, value, checked) => {
    setFilters((prev) => {
      const updated = { ...prev };

      if (checked) {
        updated[category] = [...(updated[category] || []), value];
      } else {
        updated[category] = (updated[category] || []).filter((v) => v !== value);
        if (updated[category].length === 0) delete updated[category];
      }

      onFilterChange(updated); // Notify App.jsx
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {Object.entries(tagOptions).map(([category, values]) => (
        <div key={category}>
          <h3 className="capitalize font-semibold text-lg mb-1">{category.replace('_', ' ')}</h3>
          <div className="flex flex-wrap gap-4">
            {values.map((value) => (
              <label key={value} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  name={category}
                  value={value}
                  className="form-checkbox text-blue-500"
                  onChange={(e) =>
                    handleCheckboxChange(category, value, e.target.checked)
                  }
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TagFilters;
