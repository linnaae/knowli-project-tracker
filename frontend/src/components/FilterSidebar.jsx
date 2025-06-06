import React, { useState } from 'react';
import tagOptions from '../constants/tagOptions.json';

function FilterSidebar({ filters, setFilters, matchModes, setMatchModes, clearFilters }) {
  const [collapsed, setCollapsed] = useState(() => {
    const initial = {};
    Object.keys(tagOptions).forEach(cat => {
      initial[cat] = true; // collapsed by default
    });
    return initial;
  });

  const toggleCollapse = (category) => {
    setCollapsed(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleCheckboxChange = (category, value) => {
    const prev = filters[category] || [];
    const newValues = prev.includes(value)
      ? prev.filter(v => v !== value)
      : [...prev, value];

    const updated = { ...filters };
    if (newValues.length) {
      updated[category] = newValues;
    } else {
      delete updated[category];
    }
    setFilters(updated);
  };

  const handleModeChange = (category, mode) => {
    setMatchModes(prev => ({
      ...prev,
      [category]: mode,
    }));
  };

  return (
    <div className="space-y-6 text-white mt-4">
      {Object.entries(tagOptions).map(([category, values]) => (
        <div key={category} className="border-b border-gray-700 pb-2">
          <div
            className="flex justify-between items-center cursor-pointer select-none hover:text-blue-400"
            onClick={() => toggleCollapse(category)}
          >
            <h3 className="font-semibold capitalize text-sm">{category.replace('_', ' ')}</h3>
            <span className="text-lg font-bold text-blue-400">
              {collapsed[category] ? '+' : '−'}
            </span>
          </div>

          {!collapsed[category] && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-4 text-xs text-gray-300">
                <span className="font-medium">
                    Match Type:
                    <span  
                        className="ml-1 text-blue-300 cursor-help"
                        title="Use 'Any' to match projects with *at least one* of the selected tags. Use 'All' to match projects with every selected tag."
                    >
                        ⓘ
                    </span>
                </span>
                <label className="flex items-center gap-1" title="Match projects with *at least one* of the selected tags.">
                  <input
                    type="radio"
                    name={`${category}-match`}
                    value="any"
                    checked={matchModes[category] === 'any'}
                    onChange={() => handleModeChange(category, 'any')}
                    className="form-radio"
                  />
                  Any
                </label>
                <label className="flex items-center gap-1" title="Match projects with every selected tag.">
                  <input
                    type="radio"
                    name={`${category}-match`}
                    value="all"
                    checked={matchModes[category] === 'all'}
                    onChange={() => handleModeChange(category, 'all')}
                    className="form-radio"
                  />
                  All
                </label>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {values.map(value => (
                  <label
                    key={value}
                    className="flex items-center text-xs gap-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters[category]?.includes(value) || false}
                      onChange={() => handleCheckboxChange(category, value)}
                      className="form-checkbox text-blue-500"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {Object.keys(filters).length > 0 && (
        <button
            onClick={clearFilters}
            className="text-sm text-blue-400 hover:underline mt-2"
        >
            Clear All Filters
        </button>
      )}
    </div>
  );
}

export default FilterSidebar;
