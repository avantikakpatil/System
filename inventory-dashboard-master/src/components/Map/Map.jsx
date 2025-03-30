import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
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
  iconSize: [30, 45], // Larger warehouse icon
  iconAnchor: [15, 45],
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

// Map control component for auto-zooming to bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
};

const Map = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [optimizedPath, setOptimizedPath] = useState([]);
  const [routeSegments, setRouteSegments] = useState([]);
  const [showOptimized, setShowOptimized] = useState(true);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center on India
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level
  const [isLoading, setIsLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState([]);
  const [customerDistances, setCustomerDistances] = useState({});
  const [routeStops, setRouteStops] = useState([]);
  const mapRef = useRef(null);

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

  // Function to fetch driving route from OpenRouteService API
  const fetchDrivingRoute = async (startCoords, endCoords) => {
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: {
          'Authorization': '5b3ce3597851110001cf62487711329921f54f19ad2fd4909b04a6c4',
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        },
        body: JSON.stringify({
          coordinates: [
            [startCoords[1], startCoords[0]], // OpenRouteService uses [lon, lat] format
            [endCoords[1], endCoords[0]]
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the route coordinates and convert from [lon, lat] to [lat, lon] format
      if (data && data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
        const routeCoordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Extract the distance from the API response
        const distance = data.features[0].properties.summary?.distance || null;
        
        return {
          path: routeCoordinates,
          distance: distance ? (distance / 1000).toFixed(2) : null // Convert to km and format
        };
      } else {
        console.error('Unexpected API response structure:', data);
        return {
          path: [startCoords, endCoords],
          distance: calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]).toFixed(2)
        };
      }
    } catch (error) {
      console.error('Error fetching driving route:', error);
      // Return a straight line as fallback and calculate distance
      return {
        path: [startCoords, endCoords],
        distance: calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]).toFixed(2)
      };
    }
  };

  const createDeliveryRoutes = async () => {
    setIsLoading(true);
    
    // Get customers with orders from selected warehouse
    const customersWithOrders = orders
      .filter(order => order.warehouseId === selectedWarehouse.id)
      .map(order => {
        // Using customerId instead of userId
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
      setRouteSegments([]);
      setMapBounds([]);
      setCustomerDistances({});
      setRouteStops([]);
      setIsLoading(false);
      return;
    }

    // Create a collection of all points for bounds calculation
    let allPoints = [[selectedWarehouse.latitude, selectedWarehouse.longitude]];
    
    // Store distances from warehouse to each customer
    const distances = {};
    
    // Track all route stops for the driver (with sequence numbers)
    const stops = [
      {
        type: 'source',
        number: 0,
        name: selectedWarehouse.name,
        location: [selectedWarehouse.latitude, selectedWarehouse.longitude],
        description: 'Starting point (Warehouse)'
      }
    ];

    // Create simple route: warehouse -> customers -> warehouse (non-optimized)
    try {
      let simplePathSegments = [];
      // For segmented routes
      let segments = [];
      
      // Add warehouse to first customer
      const warehouseCoords = [selectedWarehouse.latitude, selectedWarehouse.longitude];
      const firstCustomerCoords = [customersWithOrders[0].latitude, customersWithOrders[0].longitude];
      
      const firstSegmentData = await fetchDrivingRoute(warehouseCoords, firstCustomerCoords);
      simplePathSegments = simplePathSegments.concat(firstSegmentData.path);
      
      // Store distance from warehouse to first customer
      distances[customersWithOrders[0].id] = firstSegmentData.distance;
      
      // Add the first segment
      segments.push({
        path: firstSegmentData.path,
        type: 'warehouse-to-customer',
        startName: selectedWarehouse.name,
        endName: customersWithOrders[0].name,
        distance: firstSegmentData.distance,
        color: '#0F3460', // Dark blue for first segment
        weight: 5
      });
      
      // Add first customer to stops
      stops.push({
        type: 'waypoint',
        number: 1,
        name: customersWithOrders[0].name,
        location: [customersWithOrders[0].latitude, customersWithOrders[0].longitude],
        description: 'Delivery Point 1',
        distance: firstSegmentData.distance + ' km from warehouse'
      });
      
      // Add customer to customer segments
      for (let i = 0; i < customersWithOrders.length - 1; i++) {
        const startCoords = [customersWithOrders[i].latitude, customersWithOrders[i].longitude];
        const endCoords = [customersWithOrders[i + 1].latitude, customersWithOrders[i + 1].longitude];
        
        const segmentData = await fetchDrivingRoute(startCoords, endCoords);
        // Remove the first point to avoid duplicates
        if (segmentData.path.length > 0) {
          simplePathSegments = simplePathSegments.concat(segmentData.path.slice(1));
        }
        
        // Add segment
        segments.push({
          path: segmentData.path,
          type: 'customer-to-customer',
          startName: customersWithOrders[i].name,
          endName: customersWithOrders[i + 1].name,
          distance: segmentData.distance,
          color: '#1A508B', // Mid blue for intermediate segments
          weight: 4
        });
        
        // Add to stops
        stops.push({
          type: 'waypoint',
          number: i + 2, // Start from 2 for the second customer
          name: customersWithOrders[i + 1].name,
          location: [customersWithOrders[i + 1].latitude, customersWithOrders[i + 1].longitude],
          description: `Delivery Point ${i + 2}`,
          distance: segmentData.distance + ' km from previous stop'
        });
        
        // Add all customer points to the collection for bounds
        allPoints.push([customersWithOrders[i].latitude, customersWithOrders[i].longitude]);
      }
      
      // Add last customer point to bounds
      allPoints.push([
        customersWithOrders[customersWithOrders.length - 1].latitude, 
        customersWithOrders[customersWithOrders.length - 1].longitude
      ]);
      
      // Add last customer back to warehouse
      const lastCustomerCoords = [
        customersWithOrders[customersWithOrders.length - 1].latitude, 
        customersWithOrders[customersWithOrders.length - 1].longitude
      ];
      
      const lastSegmentData = await fetchDrivingRoute(lastCustomerCoords, warehouseCoords);
      // Remove the first point to avoid duplicates
      if (lastSegmentData.path.length > 0) {
        simplePathSegments = simplePathSegments.concat(lastSegmentData.path.slice(1));
      }
      
      // Add the return segment
      segments.push({
        path: lastSegmentData.path,
        type: 'customer-to-warehouse',
        startName: customersWithOrders[customersWithOrders.length - 1].name,
        endName: selectedWarehouse.name,
        distance: lastSegmentData.distance,
        color: '#0F3460', // Dark blue for return to warehouse
        weight: 5
      });
      
      // Add final destination (return to warehouse) to stops
      stops.push({
        type: 'destination',
        number: customersWithOrders.length + 1,
        name: selectedWarehouse.name,
        location: [selectedWarehouse.latitude, selectedWarehouse.longitude],
        description: 'Return to Warehouse',
        distance: lastSegmentData.distance + ' km from last delivery'
      });
      
      setRoutePath(simplePathSegments);
      setRouteSegments(segments);
      
      // For remaining customers, fetch direct distances from warehouse
      for (let i = 1; i < customersWithOrders.length; i++) {
        const customerCoords = [customersWithOrders[i].latitude, customersWithOrders[i].longitude];
        const segmentData = await fetchDrivingRoute(warehouseCoords, customerCoords);
        distances[customersWithOrders[i].id] = segmentData.distance;
      }
      
      // Create optimized route using nearest neighbor algorithm
      const optimizedRouteData = await createOptimizedRoute(selectedWarehouse, customersWithOrders);
      setOptimizedPath(optimizedRouteData.path);
      
      // Set the bounds for auto-zooming
      setMapBounds(allPoints);
      
      // Store all customer distances
      setCustomerDistances(distances);
      
      // Set the route stops
      setRouteStops(stops);
    } catch (error) {
      console.error('Error creating delivery routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOptimizedRoute = async (warehouse, customers) => {
    // Start from the warehouse
    const warehouseCoord = [warehouse.latitude, warehouse.longitude];
    let route = [];
    
    // Create a copy of customers that we can modify
    const remainingCustomers = [...customers];
    
    // If there are no customers, just return the warehouse point
    if (remainingCustomers.length === 0) {
      return { path: [warehouseCoord], totalDistance: 0 };
    }
    
    let currentCoord = warehouseCoord;
    let totalDistance = 0;
    
    // Continue until all customers have been visited
    while (remainingCustomers.length > 0) {
      // Find the nearest unvisited customer
      let nearestIndex = 0;
      let minDistance = Number.MAX_VALUE;
      
      for (let i = 0; i < remainingCustomers.length; i++) {
        const customer = remainingCustomers[i];
        const distance = calculateDistance(
          currentCoord[0], 
          currentCoord[1], 
          customer.latitude, 
          customer.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Get next customer coordinates
      const nextCustomer = remainingCustomers[nearestIndex];
      const nextCoord = [nextCustomer.latitude, nextCustomer.longitude];
      
      // Fetch the actual driving route between current point and next customer
      const pathSegmentData = await fetchDrivingRoute(currentCoord, nextCoord);
      
      // For the first segment, add all points
      if (route.length === 0) {
        route = route.concat(pathSegmentData.path);
      } else {
        // For subsequent segments, skip the first point to avoid duplicates
        route = route.concat(pathSegmentData.path.slice(1));
      }
      
      // Update current point and remove this customer from the remaining list
      currentCoord = nextCoord;
      remainingCustomers.splice(nearestIndex, 1);
      
      // Add distance
      totalDistance += parseFloat(pathSegmentData.distance);
    }
    
    // Return to the warehouse to complete the route
    const returnSegmentData = await fetchDrivingRoute(currentCoord, warehouseCoord);
    // Remove the first point to avoid duplicates
    route = route.concat(returnSegmentData.path.slice(1));
    
    // Add return distance
    totalDistance += parseFloat(returnSegmentData.distance);
    
    return { path: route, totalDistance: totalDistance.toFixed(2) };
  };

  const handleWarehouseChange = (warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  // Filter customers to only show those with orders from the selected warehouse
  const getVisibleCustomers = () => {
    if (!selectedWarehouse || !orders.length) return [];
    
    // Using customerId instead of userId
    return customers.filter(customer => 
      orders.some(order => 
        order.warehouseId === selectedWarehouse.id && 
        order.customerId === customer.id
      )
    );
  };

  const visibleCustomers = getVisibleCustomers();

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
      
      <div className="h-96 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Calculating routes...</p>
            </div>
          </div>
        )}
      
        {warehouses.length > 0 && (
          <MapContainer 
            center={mapCenter}
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Auto-zoom to bounds component */}
            {mapBounds.length > 0 && <FitBounds bounds={mapBounds} />}
            
            {/* Display route segments with different styling based on segment type */}
            {!showOptimized && routeSegments.map((segment, idx) => (
              <Polyline 
                key={`segment-${idx}`}
                positions={segment.path}
                color={segment.color}
                weight={segment.weight}
                opacity={0.9}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">Route Segment</h3>
                    <p>From: {segment.startName}</p>
                    <p>To: {segment.endName}</p>
                    <p>Distance: {segment.distance} km</p>
                    <p>{segment.type === 'warehouse-to-customer' ? 'First delivery' : 
                        segment.type === 'customer-to-warehouse' ? 'Return to warehouse' : 
                        'Between delivery points'}</p>
                  </div>
                </Popup>
              </Polyline>
            ))}
            
            {/* Display optimized route if selected with enhanced styling */}
            {showOptimized && optimizedPath.length > 0 && (
              <Polyline 
                positions={optimizedPath}
                color="#0F3460"
                weight={5}
                opacity={0.9}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">Optimized Route</h3>
                    <p>Starting point: {selectedWarehouse.name}</p>
                    <p>Number of delivery points: {visibleCustomers.length}</p>
                    <p>Returns to warehouse at the end</p>
                  </div>
                </Popup>
              </Polyline>
            )}
            
            {/* Display sequence numbers for each stop */}
            {routeStops.map((stop, idx) => (
              <CircleMarker
                key={`stop-marker-${idx}`}
                center={stop.location}
                radius={stop.type === 'source' || stop.type === 'destination' ? 8 : 6}
                fillColor={stop.type === 'source' ? '#003049' : 
                          stop.type === 'destination' ? '#003049' : '#D62828'}
                fillOpacity={0.9}
                stroke={true}
                color="white"
                weight={2}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{stop.type === 'source' ? 'Starting Point' : 
                                              stop.type === 'destination' ? 'Final Destination' : 
                                              `Stop #${stop.number}`}</h3>
                    <p>{stop.name}</p>
                    <p>{stop.description}</p>
                    {stop.distance && <p>Distance: {stop.distance}</p>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            
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
                    <p className="font-semibold mt-2">Source & Destination</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Display customers with orders from the selected warehouse */}
            {visibleCustomers.map((customer, index) => (
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
                    {customerDistances[customer.id] && (
                      <p className="font-semibold mt-2">
                        Distance from warehouse: {customerDistances[customer.id]} km
                      </p>
                    )}
                    <p className="font-semibold">Delivery Stop #{index + 1}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      
      {/* Driver Route Information Panel */}
      <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-bold mb-2">Driver Route Information</h3>
        
        {routeStops.length > 0 ? (
          <div className="space-y-3">
            {routeStops.map((stop, idx) => (
              <div key={`route-stop-${idx}`} className="flex items-start space-x-3 p-2 border-b border-gray-200">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  stop.type === 'source' ? 'bg-blue-800' : 
                  stop.type === 'destination' ? 'bg-blue-800' : 'bg-red-600'
                }`}>
                  {stop.number}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold">{stop.name}</div>
                  <div className="text-sm text-gray-600">{stop.description}</div>
                  {stop.distance && (
                    <div className="text-sm text-gray-700 mt-1">{stop.distance}</div>
                  )}
                </div>
                {idx < routeStops.length - 1 && (
                  <div className="flex-shrink-0 text-gray-500">
                    ↓
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <span className="font-bold">Total Stops:</span> {routeStops.length} (including warehouse as source and destination)
            </div>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            No route information available. Please select a warehouse with customer orders.
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Map Legend</h3>
          <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-6 h-6 bg-blue-800 rounded-full mr-2 flex-shrink-0"></span>
              <span>Warehouse (Source & Destination)</span>
            </p>
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-6 h-6 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
              <span>Customer Locations (Delivery Points)</span>
            </p>
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-16 h-2 bg-blue-900 mr-2 flex-shrink-0"></span>
              <span>Route From Warehouse & Return to Warehouse</span>
            </p>
            <p className="text-sm flex items-center">
              <span className="inline-block w-16 h-2 bg-blue-700 mr-2 flex-shrink-0"></span>
              <span>Route Between Delivery Points</span>
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Customer Distances from Warehouse</h3>
          {visibleCustomers.length > 0 ? (
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 shadow-sm">
              {visibleCustomers.map((customer, index) => (
                <div key={`distance-${customer.id}`} className="text-sm mb-2 flex">
                  <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium">{customer.name}: </span>
                    {customerDistances[customer.id] ? 
                      `${customerDistances[customer.id]} km` : 
                      'Calculating...'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-600 text-sm">
              No customer distances to display.
            </div>
          )}
        </div>
      </div>
      
      {visibleCustomers.length === 0 && selectedWarehouse && (
        <div className="mt-4 p-3 bg-yellow-100 rounded text-yellow-800">
          No customers with orders found for this warehouse.
        </div>
      )}
    </div>
  );
};

export default Map;