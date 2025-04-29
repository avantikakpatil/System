import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { assignTruck, getAvailableTrucks, removeAssignment } from '../../services/api';
import { getAssignedOrders } from '../../services/api';

const AssignTruck = () => {
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' or 'view'
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeletingTruck, setIsDeletingTruck] = useState(false);
  const [truckToUnassign, setTruckToUnassign] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await api.get('/orders');
      setOrders(ordersResponse.data);
      
      // Fetch trucks
      const trucksData = await getAvailableTrucks();
      setTrucks(trucksData);
      
      // Fetch assigned orders with customer details
      const assignedOrdersData = await getAssignedOrders();
      console.log("Assigned orders data:", assignedOrdersData);
      
      // Enhance assigned orders with full customer details if needed
      const enhancedAssignedOrders = await Promise.all(
        assignedOrdersData.map(async (order) => {
          // If customer details are missing, fetch them
          if (!order.latitude || !order.longitude || !order.customerName) {
            try {
              // Fetch complete order details from orders API
              const orderDetails = await api.get(`/orders/${order.id}`);
              return { ...order, ...orderDetails.data };
            } catch (err) {
              console.error(`Failed to fetch details for order ${order.id}:`, err);
              return order;
            }
          }
          return order;
        })
      );
      
      setAssignedOrders(enhancedAssignedOrders);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleTruckSelection = (truckId) => {
    setSelectedTruckId(truckId);
    
    // Auto-fill driver name when selecting a truck
    const selectedTruck = trucks.find(truck => truck.id === parseInt(truckId));
    if (selectedTruck) {
      setDriverName(selectedTruck.driverName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTruckId) {
      setError("Please select a truck");
      return;
    }
    
    try {
      await assignTruck({
        orderIds: selectedOrders,
        truckId: parseInt(selectedTruckId),
        driverName: driverName,
      });

      // Set success message
      setSuccessMessage('Orders assigned successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);

      // Refresh data
      await fetchData();

      // Clear form
      setSelectedOrders([]);
      setSelectedTruckId('');
      setDriverName('');
      
      // Switch to the view tab
      setActiveTab('view');

    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setOrderToDelete(null);
    setIsDeleting(false);
    setTruckToUnassign(null);
    setIsDeletingTruck(false);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await removeAssignment(orderToDelete.id);
      // Refresh data
      await fetchData();
      // Show success message
      setSuccessMessage('Order assignment removed successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to remove assignment: ${err.message}`);
    } finally {
      setOrderToDelete(null);
      setIsDeleting(false);
    }
  };

  const confirmUnassignTruck = (truckNumber) => {
    // Get all orders for this truck
    const truckOrders = assignedOrders.filter(order => order.truckNumber === truckNumber);
    if (truckOrders.length === 0) return;
    
    setTruckToUnassign({ 
      truckNumber,
      orderCount: truckOrders.length 
    });
    setIsDeletingTruck(true);
  };

  const handleUnassignTruck = async () => {
    if (!truckToUnassign) return;
    
    try {
      // Get all orders for this truck
      const truckOrders = assignedOrders.filter(order => order.truckNumber === truckToUnassign.truckNumber);
      
      // Remove each assignment
      for (const order of truckOrders) {
        await removeAssignment(order.id);
      }
      
      // Refresh data
      await fetchData();
      
      // Show success message
      setSuccessMessage(`All assignments for truck ${truckToUnassign.truckNumber} removed successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to unassign truck: ${err.message}`);
    } finally {
      setTruckToUnassign(null);
      setIsDeletingTruck(false);
    }
  };

  // Enhanced helper function to safely get properties with fallback options
  const getPropertySafely = (obj, property, alternatives = [], defaultValue = 'Not specified') => {
    if (obj && obj[property] !== undefined && obj[property] !== null && obj[property] !== '') {
      return obj[property];
    }
    
    // Try alternative property names if provided
    if (alternatives && alternatives.length > 0) {
      for (const alt of alternatives) {
        if (obj && obj[alt] !== undefined && obj[alt] !== null && obj[alt] !== '') {
          return obj[alt];
        }
      }
    }
    
    return defaultValue;
  };

  // Group assigned orders by truck for better display
  const assignedOrdersByTruck = assignedOrders.reduce((acc, order) => {
    if (!acc[order.truckNumber]) {
      acc[order.truckNumber] = {
        truckNumber: order.truckNumber,
        driverName: order.driverName || 'Not specified',
        orders: []
      };
    }
    acc[order.truckNumber].orders.push(order);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  const groupedOrders = orders.reduce((acc, order) => {
    const warehouse = order.warehouseName || 'Unassigned Warehouse';
    if (!acc[warehouse]) {
      acc[warehouse] = [];
    }
    acc[warehouse].push(order);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Truck Assignment</h1>
        <div className="w-full sm:w-auto">
          <Link
            to="/trucks/create"
            className="block w-full sm:w-auto text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Truck
          </Link>
        </div>
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

      {/* Tabs - Responsive */}
      <div className="mb-4 sm:mb-6 border-b overflow-x-auto">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-2 sm:p-4 text-sm sm:text-base ${activeTab === 'assign' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('assign')}
            >
              Assign Orders
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-2 sm:p-4 text-sm sm:text-base ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('view')}
            >
              View Assignments
            </button>
          </li>
        </ul>
      </div>

      {/* Assignment Form - Responsive */}
      {activeTab === 'assign' && (
        <div className="bg-white shadow rounded-lg p-3 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Orders Selection Section */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Select Orders</label>
                <div className="w-full p-2 border border-gray-300 rounded h-48 sm:h-64 overflow-y-auto">
                  {Object.keys(groupedOrders).length === 0 ? (
                    <p className="text-gray-500 p-2 sm:p-4 text-sm sm:text-base">No unassigned orders available.</p>
                  ) : (
                    Object.keys(groupedOrders).map((warehouse) => (
                      <div key={warehouse} className="mb-3 sm:mb-4">
                        <h2 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 bg-gray-100 p-1 sm:p-2">{warehouse}</h2>
                        {groupedOrders[warehouse].map((order) => (
                          <div key={order.id} className="flex items-start mb-1 sm:mb-2 p-1 sm:p-2 hover:bg-gray-50 text-sm sm:text-base">
                            <input
                              type="checkbox"
                              id={`order-${order.id}`}
                              value={order.id}
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleOrderSelection(order.id)}
                              className="mr-2 mt-1"
                            />
                            <label htmlFor={`order-${order.id}`} className="cursor-pointer flex-1">
                              <span className="font-medium">Order #{order.id}</span> - {order.customerName}
                              {order.deliveryAddress && <p className="text-xs sm:text-sm text-gray-600 truncate">{order.deliveryAddress}</p>}
                              {order.latitude && order.longitude && 
                                <p className="text-xs sm:text-sm text-gray-600">{order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}</p>
                              }
                            </label>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                  {selectedOrders.length} orders selected
                </div>
              </div>

              {/* Truck Selection Section */}
              <div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Select Truck</label>
                  <select
                    value={selectedTruckId}
                    onChange={(e) => handleTruckSelection(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                    required
                  >
                    <option value="">-- Select a Truck --</option>
                    {trucks.map(truck => (
                      <option key={truck.id} value={truck.id}>
                        {truck.truckNumber} - {truck.driverName} 
                        {!truck.isAvailable && " (Currently Assigned)"}
                      </option>
                    ))}
                  </select>
                  {trucks.length === 0 && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      No trucks available. Please create a truck first.
                    </p>
                  )}
                </div>
                
                <div className="mb-4 sm:mb-8">
                  <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base"
                  disabled={!selectedTruckId || selectedOrders.length === 0}
                >
                  Assign Orders to Truck
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* View Assignments - Responsive */}
      {activeTab === 'view' && (
        <div className="bg-white shadow rounded-lg p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Truck Assignment Overview</h2>
          
          {Object.values(assignedOrdersByTruck).length === 0 ? (
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg text-center">
              <p className="text-gray-500 text-sm sm:text-base">No assigned orders yet.</p>
              <button 
                onClick={() => setActiveTab('assign')}
                className="mt-3 sm:mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-sm sm:text-base"
              >
                Make Your First Assignment
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.values(assignedOrdersByTruck).map((truck) => (
                <div key={truck.truckNumber} className="border rounded-lg overflow-hidden">
                  {/* Truck Header - Responsive */}
                  <div className="bg-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="font-bold text-base sm:text-lg">{truck.truckNumber}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Driver: {truck.driverName}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 py-0.5 rounded">
                        {truck.orders.length} Orders
                      </span>
                      <button
                        onClick={() => confirmUnassignTruck(truck.truckNumber)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                        title="Unassign all orders from this truck"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-xs sm:text-sm">Unassign All</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Responsive Table for Larger Screens */}
                  <div className="hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                          <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {truck.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">#{order.id}</td>
                            <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                              {getPropertySafely(order, 'customerName', ['customer', 'customer_name'])}
                              {order.companyName && 
                                <div className="text-xs text-gray-500">
                                  {getPropertySafely(order, 'companyName', ['company', 'company_name'])}
                                </div>
                              }
                            </td>
                            <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                              {getPropertySafely(order, 'warehouseName', ['warehouse', 'warehouse_name'])}
                            </td>
                            <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm">
                              {order.deliveryAddress || getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address']) ? (
                                <div className="mb-1 truncate max-w-xs">
                                  {order.deliveryAddress || getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address'])}
                                </div>
                              ) : null}
                              {(order.latitude !== undefined || order.lat !== undefined || 
                                order.longitude !== undefined || order.lng !== undefined) ? (
                                <div className="text-xs text-gray-600">
                                  {getPropertySafely(order, 'latitude', ['lat'])}, 
                                  {getPropertySafely(order, 'longitude', ['lng'])}
                                </div>
                              ) : (
                                !order.deliveryAddress && 
                                !getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address']) && 
                                <span className="text-gray-400 text-xs">No location data</span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => confirmDeleteOrder(order)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove assignment"
                                aria-label="Unassign order"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Card View for Mobile Screens */}
                  <div className="sm:hidden">
                    {truck.orders.map((order) => (
                      <div key={order.id} className="border-b last:border-b-0 p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-sm">Order #{order.id}</div>
                            <div className="text-sm">{getPropertySafely(order, 'customerName', ['customer', 'customer_name'])}</div>
                            {order.companyName && 
                              <div className="text-xs text-gray-500">
                                {getPropertySafely(order, 'companyName', ['company', 'company_name'])}
                              </div>
                            }
                          </div>
                          <button
                            onClick={() => confirmDeleteOrder(order)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove assignment"
                            aria-label="Unassign order"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-1">
                          Warehouse: {getPropertySafely(order, 'warehouseName', ['warehouse', 'warehouse_name'])}
                        </div>
                        
                        {order.deliveryAddress || getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address']) ? (
                          <div className="text-xs text-gray-600 mb-1 truncate">
                            {order.deliveryAddress || getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address'])}
                          </div>
                        ) : null}
                        
                        {(order.latitude !== undefined || order.lat !== undefined || 
                          order.longitude !== undefined || order.lng !== undefined) ? (
                          <div className="text-xs text-gray-600">
                            Location: {getPropertySafely(order, 'latitude', ['lat'])}, 
                            {getPropertySafely(order, 'longitude', ['lng'])}
                          </div>
                        ) : (
                          !order.deliveryAddress && 
                          !getPropertySafely(order, 'shippingAddress', ['shipping_address', 'address', 'delivery_address']) && 
                          <span className="text-xs text-gray-400">No location data</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Order Confirmation Modal - Responsive */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Confirm Unassign</h3>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to remove the assignment for order <span className="font-bold">#{orderToDelete?.id}</span> from truck <span className="font-bold">{orderToDelete?.truckNumber}</span>?
            </p>
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={cancelDelete}
                className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
              >
                Unassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Truck Assignments Confirmation Modal - Responsive */}
      {isDeletingTruck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Confirm Unassign All</h3>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to remove <span className="font-bold">all {truckToUnassign?.orderCount} order assignments</span> from truck <span className="font-bold">{truckToUnassign?.truckNumber}</span>?
            </p>
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={cancelDelete}
                className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUnassignTruck}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
              >
                Unassign All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTruck;