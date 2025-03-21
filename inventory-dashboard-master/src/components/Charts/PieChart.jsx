import React from 'react';

const PieChart = () => {
  return (
    <div className="relative h-48">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path
          d="M50,50 L50,0 A50,50 0 0,1 93.3,25 Z"
          fill="#4299e1"
        />
        <path
          d="M50,50 L93.3,25 A50,50 0 0,1 93.3,75 Z"
          fill="#805ad5"
        />
        <path
          d="M50,50 L93.3,75 A50,50 0 0,1 50,100 Z"
          fill="#f6ad55"
        />
      </svg>
    </div>
  );
};

export default PieChart;