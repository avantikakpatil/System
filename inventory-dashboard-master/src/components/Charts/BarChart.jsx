import React from 'react';

const BarChart = () => {
  const data = [60, 100, 40, 80, 35, 75, 90];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="h-full w-full flex items-end justify-between py-2">
      {data.map((height, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-8 mx-1 relative">
            <div className="absolute bottom-0 w-full">
              <div 
                className="bg-blue-500 rounded-t" 
                style={{ height: `${height * 2}px` }}
              ></div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">{days[index]}</div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;