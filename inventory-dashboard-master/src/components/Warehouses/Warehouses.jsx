// src/components/Warehouses/Warehouses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWarehouses, deleteWarehouse } from '../../services/api';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWarehouse, setExpandedWarehouse] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await getWarehouses();
        setWarehouses(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
        setError('Failed to fetch warehouses. Please try again later.');
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await deleteWarehouse(id);
        setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
      } catch (err) {
        setError('Failed to delete the warehouse');
      }
    }
  };

  const toggleExpandWarehouse = (id) => {
    if (expandedWarehouse === id) {
      setExpandedWarehouse(null);
    } else {
      setExpandedWarehouse(id);
    }
  };

  if (loading) return <div className="text-center p-6">Loading warehouses...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Warehouses</h1>
        <Link to="/warehouses/add" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
          Add Warehouse
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Desktop view: Standard table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No warehouses found</td>
              </tr>
            ) : (
              warehouses.map(warehouse => (
                <tr key={warehouse.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warehouse.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{warehouse.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {warehouse.latitude !== undefined && warehouse.longitude !== undefined 
                      ? `${parseFloat(warehouse.latitude).toFixed(6)}, ${parseFloat(warehouse.longitude).toFixed(6)}`
                      : 'No coordinates'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {warehouse.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/warehouses/edit/${warehouse.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(warehouse.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Card layout */}
      <div className="md:hidden space-y-4">
        {warehouses.length === 0 ? (
          <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            No warehouses found
          </div>
        ) : (
          warehouses.map(warehouse => (
            <div key={warehouse.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpandWarehouse(warehouse.id)}
              >
                <div className="font-medium text-gray-900">{warehouse.name}</div>
                <div className="flex items-center">
                  <span className={`mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <svg 
                    className={`h-5 w-5 text-gray-500 transform ${expandedWarehouse === warehouse.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedWarehouse === warehouse.id && (
                <div className="px-4 py-3 space-y-3 bg-gray-50">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</div>
                    <div className="mt-1 text-sm text-gray-900">{warehouse.address}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {warehouse.latitude !== undefined && warehouse.longitude !== undefined 
                        ? `${parseFloat(warehouse.latitude).toFixed(6)}, ${parseFloat(warehouse.longitude).toFixed(6)}`
                        : 'No coordinates'}
                    </div>
                  </div>
                  
                  <div className="pt-2 flex space-x-3 border-t border-gray-200">
                    <Link 
                      to={`/warehouses/edit/${warehouse.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Warehouses;