import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import BarChart from '../Charts/BarChart';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import { getUsers } from '../../services/api'; // Import the API service

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get first letter of name or fallback to "?"
  const getInitial = (user) => {
    if (user && user.name && typeof user.name === 'string') {
      return user.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 md:p-4 flex justify-between items-center">
        <h1 className="text-lg md:text-2xl font-medium text-gray-700">Order Statistic</h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile hamburger menu */}
          <button 
            className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none" 
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {/* Search - hidden on smallest screens */}
          <div className="relative   sm:block">
            <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1 border rounded-md text-sm w-32 md:w-auto" />
            <div className="absolute left-2 top-2 text-gray-400">🔍</div>
          </div>
          
          {/* User profile */}
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">AP</div>
          <span className="hidden sm:inline font-medium text-sm md:text-base">Avantika</span>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-4">
          <div className="mb-4">
            <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1 border rounded-md w-full" />
            <div className="absolute left-6 top-24 text-gray-400">🔍</div>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">AP</div>
            <span className="font-medium">Avantika Patil</span>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="p-3 md:p-6">
        {/* Stat Cards - Stacked on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <StatCard 
            icon="💰" 
            iconBg="bg-blue-100" 
            value="23" 
            label="Total Purchase" 
            change="+12%" 
            changeColor="text-green-500" 
          />
          <StatCard 
            icon="📦" 
            iconBg="bg-blue-100" 
            value="27" 
            label="Today's Orders" 
            change="+17.5%" 
            changeColor="text-green-500" 
          />
          <StatCard 
            icon="⏱️" 
            iconBg="bg-red-100" 
            value="12" 
            label="Products" 
            change="+3.7%" 
            changeColor="text-green-500" 
          />
          <StatCard 
            icon="👥" 
            iconBg="bg-yellow-100" 
            value="19" 
            label="Total Shipment" 
            change="+10.9%" 
            changeColor="text-green-500" 
          />
        </div>

        {/* Charts Section - Stacked on small screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Order Overview Chart */}
          <div className="bg-white p-3 md:p-4 rounded-md shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-medium mb-2 sm:mb-0">Order overview</h2>
              <div className="flex flex-wrap items-center text-xs md:text-sm">
                <span className="flex items-center mr-3 md:mr-4 mb-1 sm:mb-0">
                  <span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-blue-500 mr-1"></span>
                  Order
                </span>
                <span className="flex items-center">
                  <span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-teal-400 mr-1"></span>
                  Sales
                </span>
              </div>
            </div>
            <div className="h-48 md:h-64 w-full">
              <BarChart />
            </div>
          </div>

          {/* User List */}
          <div className="bg-white p-3 md:p-4 rounded-md shadow">
            <h2 className="text-base md:text-lg font-medium mb-3 md:mb-4">All Users</h2>
            {loading ? (
              <div className="text-center p-2 md:p-4 text-sm">Loading users...</div>
            ) : error ? (
              <div className="text-center p-2 md:p-4 text-red-500 text-sm">{error}</div>
            ) : (
              <div className="h-40 md:h-48 overflow-auto border rounded-md p-2">
                <ul className="space-y-1">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <li key={user.id || index} className="flex items-center py-1 border-b border-gray-100">
                        <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-2 text-xs md:text-sm">
                          {getInitial(user)}
                        </span>
                        <span className="text-sm md:text-base">{user.name || 'Unnamed User'}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No users found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

         {/* Bottom Row - Stacked on small screens */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Channel Distribution */}
          <div className="bg-white p-3 md:p-4 rounded-md shadow">
            <h2 className="text-base md:text-lg font-medium mb-3 md:mb-4">Order by Channel</h2>
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                <PieChart />
              </div>
              <div className="w-full sm:w-1/2 flex flex-col justify-center text-sm md:text-base">
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-blue-500 mr-1"></span>
                      Amazon
                    </span>
                    <span>37%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-purple-500 mr-1"></span>
                      Facebook
                    </span>
                    <span>32%</span>
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-orange-400 mr-1"></span>
                      Pinterest
                    </span>
                    <span>31%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="bg-white p-3 md:p-4 rounded-md shadow">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-medium">Sales Overview</h2>
              <div>
                <span className="text-xl md:text-2xl font-bold text-blue-600">745</span>
                <span className="text-xs md:text-sm text-green-500 ml-1 md:ml-2">+12%</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
              <div className="w-full sm:w-2/3 mb-3 sm:mb-0">
                <LineChart />
              </div>
              <div className="w-full sm:w-1/3 text-right">
                <div className="text-green-500">
                  <span className="text-lg md:text-xl font-bold">+3.7%</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600">22%</div>
                <div className="mt-2 md:mt-4">
                  <span className="block text-xs md:text-sm text-gray-500">40%</span>
                  <span className="block text-xs md:text-sm text-gray-500 mt-2 md:mt-4">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;