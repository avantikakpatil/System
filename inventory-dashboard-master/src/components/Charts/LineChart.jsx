import React from 'react';

const LineChart = () => {
  return (
    <div className="h-32 w-full flex items-end justify-between relative">
      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="border-b border-gray-200"></div>
        <div className="border-b border-gray-200"></div>
        <div className="border-b border-gray-200"></div>
      </div>
      <svg className="h-full w-full" viewBox="0 0 100 50">
        <path
          d="M0,40 L10,35 L20,38 L30,30 L40,25 L50,28 L60,20 L70,15 L80,18 L90,10 L100,12"
          fill="none"
          stroke="#4299e1"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default LineChart;