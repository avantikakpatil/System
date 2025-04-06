import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { assignTruck, getAvailableTrucks } from '../../services/api';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersResponse = await api.get('/orders');
        setOrders(ordersResponse.data);
        
        // Fetch trucks
        const trucksData = await getAvailableTrucks();
        setTrucks(trucksData);
        
        // Fetch assigned orders
        const assignedOrdersData = await getAssignedOrders();
        setAssignedOrders(assignedOrdersData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

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

      // Refresh the data after submission
      const refreshedOrders = await getAssignedOrders();
      setAssignedOrders(refreshedOrders);
      
      // Refresh the available trucks
      const refreshedTrucks = await getAvailableTrucks();
      setTrucks(refreshedTrucks);

      // Clear form
      setSelectedOrders([]);
      setSelectedTruckId('');
      setDriverName('');

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading data...</div>;
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Select Truck</label>
            <select
              value={selectedTruckId}
              onChange={(e) => handleTruckSelection(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
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
            disabled={!selectedTruckId || selectedOrders.length === 0}
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
                {order.warehouseName && `, Warehouse: ${order.warehouseName}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignTruck;