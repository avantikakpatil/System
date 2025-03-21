import React from 'react';

const SidebarItem = ({ icon, text, active, badge }) => (
  <div className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-700 ${active ? 'bg-blue-800' : ''}`}>
    <span className="text-lg mr-3">{icon}</span>
    <span className="flex-1">{text}</span>
    {badge && (
      <span className="bg-blue-600 text-xs rounded-full px-2 py-1">{badge}</span>
    )}
  </div>
);

export default SidebarItem;