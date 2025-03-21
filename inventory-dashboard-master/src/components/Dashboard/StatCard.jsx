import React from 'react';

const StatCard = ({ icon, iconBg, value, label, change, changeColor }) => (
  <div className="bg-white p-4 rounded-md shadow flex items-start">
    <div className={`${iconBg} p-2 rounded mr-3`}>{icon}</div>
    <div>
      <div className="flex items-center">
        <h3 className="text-xl font-bold">{value}</h3>
        <span className={`text-sm ml-2 ${changeColor}`}>{change}</span>
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  </div>
);

export default StatCard;