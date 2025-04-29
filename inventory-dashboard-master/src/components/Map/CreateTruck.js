import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTruck, getAvailableTrucks, deleteTruck } from '../../services/api';

const CreateTruck = () => {
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);
  const [expandedTruck, setExpandedTruck] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        const trucksData = await getAvailableTrucks();
        setTrucks(trucksData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTruck({
        truckNumber,
        driverName
      });
      // Refresh the truck list after creating a new truck
      const refreshedTrucks = await getAvailableTrucks();
      setTrucks(refreshedTrucks);
      // Clear the form
      setTruckNumber('');
      setDriverName('');
      // Show success message
      setSuccessMessage('Truck created successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteTruck = (truck) => {
    setTruckToDelete(truck);
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setTruckToDelete(null);
    setIsDeleting(false);
  };

  const handleDeleteTruck = async () => {
    if (!truckToDelete) return;
    
    try {
      await deleteTruck(truckToDelete.id);
      // Refresh the truck list after deletion
      const refreshedTrucks = await getAvailableTrucks();
      setTrucks(refreshedTrucks);
      // Show success message
      setSuccessMessage('Truck deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to delete truck: ${err.message}`);
    } finally {
      setTruckToDelete(null);
      setIsDeleting(false);
    }
  };

  const toggleExpandTruck = (id) => {
    if (expandedTruck === id) {
      setExpandedTruck(null);
    } else {
      setExpandedTruck(id);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Create New Truck</h1>
        <Link
          to="/assign-truck"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm w-full sm:w-auto text-center"
        >
          Back to Assign Trucks
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs sm:text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base">
          <p>{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage('')}
            className="text-xs sm:text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Create Truck Form */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Add New Truck</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-1 sm:mb-2">Truck Number</label>
              <input
                type="text"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                required
                placeholder="Enter truck number (e.g., TR-001)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-1 sm:mb-2">Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                required
                placeholder="Enter driver's full name"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
              >
                Create Truck
              </button>
              <button
                type="button"
                onClick={() => navigate('/assign-truck')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Trucks List */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Existing Trucks</h2>
          {loading ? (
            <div className="text-center py-4 text-sm">Loading trucks...</div>
          ) : trucks.length === 0 ? (
            <div className="bg-gray-100 p-3 sm:p-4 rounded text-center text-sm">
              No trucks available. Create your first truck!
            </div>
          ) : (
            <>
              {/* Desktop/Tablet Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                      <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Truck Number</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Driver Name</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Status</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-xs sm:text-sm">
                    {trucks.map((truck) => (
                      <tr key={truck.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-3 sm:py-3 sm:px-6 text-left">{truck.truckNumber}</td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 text-left">{truck.driverName}</td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${truck.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {truck.isAvailable ? 'Available' : 'Assigned'}
                          </span>
                        </td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">
                          <button
                            onClick={() => confirmDeleteTruck(truck)}
                            className={`text-red-600 hover:text-red-800 ${!truck.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!truck.isAvailable}
                            title={!truck.isAvailable ? "Cannot delete assigned truck" : "Delete truck"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {trucks.map((truck) => (
                  <div key={truck.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpandTruck(truck.id)}
                    >
                      <div className="font-medium text-sm">{truck.truckNumber}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${truck.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {truck.isAvailable ? 'Available' : 'Assigned'}
                        </span>
                        <svg 
                          className={`h-4 w-4 text-gray-500 transform transition-transform ${expandedTruck === truck.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {expandedTruck === truck.id && (
                      <div className="p-3 text-sm border-t border-gray-200">
                        <div className="mb-2">
                          <span className="font-medium text-gray-500">Driver:</span> {truck.driverName}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (truck.isAvailable) confirmDeleteTruck(truck);
                            }}
                            className={`flex items-center space-x-1 text-red-600 ${!truck.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!truck.isAvailable}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-md sm:text-lg font-bold mb-3 sm:mb-4">Confirm Delete</h3>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to delete truck <span className="font-bold">{truckToDelete?.truckNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 w-full sm:w-auto text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTruck}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTruck;