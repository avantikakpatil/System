import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom warehouse icon
const warehouseIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Custom customer icon
const customerIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const Map = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [optimizedPath, setOptimizedPath] = useState([]);
  const [showOptimized, setShowOptimized] = useState(true);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center on India
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level

  useEffect(() => {
    // Fetch warehouses
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/warehouses');
        setWarehouses(response.data);
        
        // Select the first warehouse by default
        if (response.data.length > 0) {
          setSelectedWarehouse(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      }
    };

    // Fetch customers (users)
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/users');
        // Filter out users without location data
        const customersWithLocation = response.data.filter(
          user => user.latitude && user.longitude
        );
        setCustomers(customersWithLocation);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    // Fetch orders
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchWarehouses();
    fetchCustomers();
    fetchOrders();
  }, []);

  useEffect(() => {
    // Create delivery routes when warehouse and customers are loaded
    if (selectedWarehouse && customers.length > 0 && orders.length > 0) {
      createDeliveryRoutes();
      
      // Update map center and zoom to focus on selected warehouse
      setMapCenter([selectedWarehouse.latitude, selectedWarehouse.longitude]);
      setMapZoom(10);
    }
  }, [selectedWarehouse, customers, orders]);

  // Calculate the distance between two points using the Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const createDeliveryRoutes = () => {
    // Get customers with orders from selected warehouse
    const customersWithOrders = orders
      .filter(order => order.warehouseId === selectedWarehouse.id)
      .map(order => {
        // Fixed: Using customerId instead of userId
        const customer = customers.find(c => c.id === order.customerId);
        return {
          ...customer,
          orderId: order.id
        };
      })
      .filter(customer => customer && customer.latitude && customer.longitude);

    if (customersWithOrders.length === 0) {
      setRoutePath([]);
      setOptimizedPath([]);
      return;
    }

    // Create simple route: warehouse -> customers -> warehouse (non-optimized)
    const simplePath = [
      [selectedWarehouse.latitude, selectedWarehouse.longitude],
      ...customersWithOrders.map(customer => [customer.latitude, customer.longitude]),
      [selectedWarehouse.latitude, selectedWarehouse.longitude] // Return to warehouse
    ];
    setRoutePath(simplePath);

    // Create optimized route using nearest neighbor algorithm
    const optimizedRoute = createOptimizedRoute(selectedWarehouse, customersWithOrders);
    setOptimizedPath(optimizedRoute);
  };

  const createOptimizedRoute = (warehouse, customers) => {
    // Start from the warehouse
    const warehouseCoord = [warehouse.latitude, warehouse.longitude];
    const route = [warehouseCoord];
    
    // Create a copy of customers that we can modify
    const remainingCustomers = [...customers];
    
    // If there are no customers, just return the warehouse point
    if (remainingCustomers.length === 0) {
      return route;
    }
    
    let currentPoint = warehouseCoord;
    
    // Continue until all customers have been visited
    while (remainingCustomers.length > 0) {
      // Find the nearest unvisited customer
      let nearestIndex = 0;
      let minDistance = Number.MAX_VALUE;
      
      for (let i = 0; i < remainingCustomers.length; i++) {
        const customer = remainingCustomers[i];
        const distance = calculateDistance(
          currentPoint[0], 
          currentPoint[1], 
          customer.latitude, 
          customer.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Add the nearest customer to the route
      const nextCustomer = remainingCustomers[nearestIndex];
      const nextPoint = [nextCustomer.latitude, nextCustomer.longitude];
      route.push(nextPoint);
      
      // Update current point and remove this customer from the remaining list
      currentPoint = nextPoint;
      remainingCustomers.splice(nearestIndex, 1);
    }
    
    // Return to the warehouse to complete the route
    route.push(warehouseCoord);
    
    return route;
  };

  const handleWarehouseChange = (warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  // Filter customers to only show those with orders from the selected warehouse
  const getVisibleCustomers = () => {
    if (!selectedWarehouse || !orders.length) return [];
    
    // Fixed: Using customerId instead of userId
    return customers.filter(customer => 
      orders.some(order => 
        order.warehouseId === selectedWarehouse.id && 
        order.customerId === customer.id
      )
    );
  };

  const visibleCustomers = getVisibleCustomers();

  // Debug information
  console.log('Selected Warehouse:', selectedWarehouse);
  console.log('Orders:', orders);
  console.log('Customers:', customers);
  console.log('Visible Customers:', visibleCustomers);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Delivery Routes</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Warehouse:
        </label>
        <select 
          className="w-full border border-gray-300 rounded-md p-2"
          value={selectedWarehouse?.id || ''}
          onChange={(e) => {
            const selected = warehouses.find(w => w.id.toString() === e.target.value);
            handleWarehouseChange(selected);
          }}
        >
          {warehouses.map(warehouse => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} - {warehouse.location}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showOptimized}
            onChange={() => setShowOptimized(!showOptimized)}
            className="mr-2"
          />
          Show Optimized Route
        </label>
      </div>
      
      <div className="h-96 w-full">
        {warehouses.length > 0 && (
          <MapContainer 
            center={mapCenter}
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Display selected warehouse */}
            {selectedWarehouse && (
              <Marker 
                key={`warehouse-${selectedWarehouse.id}`}
                position={[selectedWarehouse.latitude, selectedWarehouse.longitude]}
                icon={warehouseIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{selectedWarehouse.name}</h3>
                    <p>{selectedWarehouse.location}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Display customers with orders from the selected warehouse */}
            {visibleCustomers.map(customer => (
              <Marker 
                key={`customer-${customer.id}`}
                position={[customer.latitude, customer.longitude]}
                icon={customerIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{customer.name}</h3>
                    <p>{customer.email}</p>
                    <p>{customer.location}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Display optimized route if selected */}
            {showOptimized && optimizedPath.length > 0 && (
              <Polyline 
                positions={optimizedPath}
                color="#4CAF50"
                weight={4}
                opacity={0.8}
              />
            )}
            
            {/* Display non-optimized route if selected */}
            {!showOptimized && routePath.length > 0 && (
              <Polyline 
                positions={routePath}
                color="#3388ff"
                weight={3}
                opacity={0.7}
                dashArray="5, 10"
              />
            )}
          </MapContainer>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>
          Warehouse Location
        </p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>
          Customer Locations
        </p>
        {showOptimized ? (
          <p className="text-sm text-gray-600">
            <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>
            Optimized Delivery Route (Nearest Neighbor)
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            <span className="inline-block w-4 h-4 border-b-2 border-blue-500 mr-2"></span>
            Basic Delivery Route (Non-Optimized)
          </p>
        )}
      </div>
      
      {visibleCustomers.length === 0 && selectedWarehouse && (
        <div className="mt-4 p-3 bg-yellow-100 rounded text-yellow-800">
          No customers with orders found for this warehouse.
        </div>
      )}
      
      {/* Debug info section (can be removed in production) */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Selected Warehouse ID: {selectedWarehouse?.id}</p>
        <p>Total Orders: {orders.length}</p>
        <p>Orders for this warehouse: {orders.filter(o => o.warehouseId === selectedWarehouse?.id).length}</p>
        <p>Total Customers: {customers.length}</p>
        <p>Visible Customers: {visibleCustomers.length}</p>
      </div>
    </div>
  );
};

export default Map;