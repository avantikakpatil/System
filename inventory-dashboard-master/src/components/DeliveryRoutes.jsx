import React, { useState } from 'react';
import Map from '../components/Map/Map';
import { FaTruck } from 'react-icons/fa';

const DeliveryRoutes = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <FaTruck className="text-blue-500 mr-2 text-xl" />
        <h1 className="text-2xl font-bold">Delivery Routes</h1>
      </div>
      
      <div className="mb-6 bg-white p-4 rounded shadow">
        <p className="text-gray-700">
          This map displays warehouse locations (red markers) and customer delivery points (blue markers).
          The dashed lines represent basic delivery routes connecting these locations.
        </p>
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden" style={{ height: "70vh" }}>
        <Map orderId={selectedOrder} />
      </div>
    </div>
  );
};

export default DeliveryRoutes;