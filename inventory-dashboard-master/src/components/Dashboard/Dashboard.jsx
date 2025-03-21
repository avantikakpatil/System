import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import BarChart from '../Charts/BarChart';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5087/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-700">Order Statistic</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1 border rounded-md" />
            <div className="absolute left-2 top-2 text-gray-400">🔍</div>
          </div>
          <img src="https://via.placeholder.com/32" alt="User" className="h-8 w-8 rounded-full" />
          <span className="font-medium">Avantika Patil</span>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            label="Today's total orders" 
            change="+17.5%" 
            changeColor="text-green-500" 
          />
          <StatCard 
            icon="⏱️" 
            iconBg="bg-red-100" 
            value="12" 
            label="product" 
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Overview Chart */}
          <div className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Order overview</h2>
              <div className="flex items-center text-sm">
                <span className="flex items-center mr-4">
                  <span className="h-3 w-3 rounded-full bg-blue-500 mr-1"></span>
                  Order
                </span>
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-teal-400 mr-1"></span>
                  Sales
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <BarChart />
            </div>
          </div>

          {/* User List */}
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">All Users</h2>
            {loading ? (
              <div className="text-center p-4">Loading users...</div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">{error}</div>
            ) : (
              <div className="h-48 overflow-auto border rounded-md p-2">
                <ul className="space-y-1">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <li key={user.id} className="flex items-center py-1 border-b border-gray-100">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-2">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{user.name}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No users found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

         {/* Bottom Row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Distribution */}
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">Order by Channel</h2>
            <div className="flex">
              <div className="w-1/2">
                <PieChart />
              </div>
              <div className="w-1/2 flex flex-col justify-center">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-blue-500 mr-1"></span>
                      Amazon
                    </span>
                    <span>37%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-purple-500 mr-1"></span>
                      Facebook
                    </span>
                    <span>32%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-orange-400 mr-1"></span>
                      Pinterest
                    </span>
                    <span>31%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Sales Overview</h2>
              <div>
                <span className="text-2xl font-bold text-blue-600">745</span>
                <span className="text-sm text-green-500 ml-2">+12%</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="w-2/3">
                <LineChart />
              </div>
              <div className="w-1/3 text-right">
                <div className="text-green-500">
                  <span className="text-xl font-bold">+3.7%</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">22%</div>
                <div className="mt-4">
                  <span className="block text-sm text-gray-500">40%</span>
                  <span className="block text-sm text-gray-500 mt-4">30%</span>
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
