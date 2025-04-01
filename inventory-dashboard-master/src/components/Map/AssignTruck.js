import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { assignTruck } from '../../services/api';
// Import the getAssignedOrders function from your API service
import { getAssignedOrders } from '../../services/api'; // Add this import

const AssignTruck = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssignedOrders = async () => {
        try {
          // Use the imported getAssignedOrders function
          const response = await getAssignedOrders();
          setAssignedOrders(response);
        } catch (err) {
          console.error("Failed to fetch assigned orders:", err);
          setError("Unable to load assigned orders. Please try again later.");
          // Initialize with empty array to prevent undefined errors
          setAssignedOrders([]);
        }
      };

    fetchOrders();
    fetchAssignedOrders();
  }, []);

  // Rest of your component code remains the same
  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignTruck({
        orderIds: selectedOrders,
        truckNumber,
        driverName,
      });

      // Refresh the assigned orders list after submission
      const refreshedOrders = await getAssignedOrders();
      setAssignedOrders(refreshedOrders);

      // Clear form
      setSelectedOrders([]);
      setTruckNumber('');
      setDriverName('');

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  const groupedOrders = orders.reduce((acc, order) => {
    const warehouse = order.warehouseName || 'Unassigned Warehouse';
    if (!acc[warehouse]) {
      acc[warehouse] = [];
    }
    acc[warehouse].push(order);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assign Truck</h1>
        <Link
          to="/trucks/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Truck
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Select Orders</label>
            <div className="w-full p-2 border border-gray-300 rounded h-40 overflow-y-auto">
              {Object.keys(groupedOrders).map((warehouse) => (
                <div key={warehouse} className="mb-4">
                  <h2 className="font-bold text-lg mb-2">{warehouse}</h2>
                  {groupedOrders[warehouse].map((order) => (
                    <div key={order.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        value={order.id}
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleOrderSelection(order.id)}
                        className="mr-2"
                      />
                      <span>Order {order.id} - {order.customerName}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Truck Number</label>
            <input
              type="text"
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Assign Truck
          </button>
        </form>
      </div>

      {/* Display Assigned Orders */}
      <div className="bg-gray-100 shadow rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Assigned Orders</h2>
        {assignedOrders.length === 0 ? (
          <p className="text-gray-500">No orders assigned yet.</p>
        ) : (
          <ul>
            {assignedOrders.map((order) => (
              <li key={order.id} className="border-b py-2">
                <span className="font-semibold">Order {order.id}</span> - {order.customerName}, Truck: {order.truckNumber}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignTruck;