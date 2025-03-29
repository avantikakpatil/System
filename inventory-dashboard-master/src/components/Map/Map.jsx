import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { FaTruck, FaWarehouse, FaUser } from 'react-icons/fa';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom warehouse icon
const warehouseIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2869/2869811.png', // Warehouse icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom customer icon
const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', // User icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const Map = ({ orderId }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default center (Mumbai)
  const [mapZoom, setMapZoom] = useState(7);

  useEffect(() => {
    // Fetch warehouses
    axios.get('/api/warehouses')
      .then(response => {
        setWarehouses(response.data);
      })
      .catch(error => console.error('Error fetching warehouses:', error));

    // Fetch customers (users)
    axios.get('/api/users')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => console.error('Error fetching customers:', error));

    // If orderId is provided, fetch order details to get the warehouse and customers for that order
    if (orderId) {
      axios.get(`/api/orders/${orderId}`)
        .then(response => {
          const order = response.data;
          setSelectedWarehouse(order.warehouseId);
          
          // Additional logic to get customer related to this order
          // This depends on your API and data structure
        })
        .catch(error => console.error('Error fetching order details:', error));
    }
  }, [orderId]);

  useEffect(() => {
    // Create route points when warehouse and customers are loaded
    if (warehouses.length > 0 && customers.length > 0) {
      let points = [];
      
      // If a specific warehouse is selected (for a specific order)
      if (selectedWarehouse) {
        const warehouse = warehouses.find(w => w.id === selectedWarehouse);
        if (warehouse) {
          // Start with the warehouse
          points.push([warehouse.latitude, warehouse.longitude]);
          
          // Add customer points
          customers.forEach(customer => {
            points.push([customer.latitude, customer.longitude]);
          });
          
          // Calculate center and zoom based on points
          const bounds = L.latLngBounds(points);
          setMapCenter(bounds.getCenter());
        }
      } else {
        // For general view, just connect all warehouses and customers
        warehouses.forEach(warehouse => {
          points.push([warehouse.latitude, warehouse.longitude]);
        });
        
        customers.forEach(customer => {
          points.push([customer.latitude, customer.longitude]);
        });
        
        // Calculate center based on all points
        if (points.length > 0) {
          const bounds = L.latLngBounds(points);
          setMapCenter(bounds.getCenter());
        }
      }
      
      setRoutePoints(points);
    }
  }, [warehouses, customers, selectedWarehouse]);

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Warehouse Markers */}
        {warehouses.map(warehouse => (
          <Marker 
            key={`warehouse-${warehouse.id}`}
            position={[warehouse.latitude, warehouse.longitude]}
            icon={warehouseIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{warehouse.name}</h3>
                <p>{warehouse.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Customer Markers */}
        {customers.map(customer => (
          <Marker 
            key={`customer-${customer.id}`}
            position={[customer.latitude, customer.longitude]}
            icon={customerIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{customer.name}</h3>
                <p>{customer.email}</p>
                <p>{customer.address}</p>
                <p>{customer.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Route Polyline */}
        {routePoints.length > 1 && (
          <Polyline 
            positions={routePoints}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;