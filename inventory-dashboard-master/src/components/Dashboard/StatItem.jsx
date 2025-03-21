import React from 'react';

const StatItem = ({ value, label, percentage = 70 }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-lg font-bold">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-1 bg-blue-500" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default StatItem;