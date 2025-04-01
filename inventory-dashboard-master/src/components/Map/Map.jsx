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
  const [routeSegments, setRouteSegments] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center on India
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level
  const [isLoading, setIsLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState([]);
  const [customerDistances, setCustomerDistances] = useState({});
  const [routeStops, setRouteStops] = useState([]);
  const [driverPath, setDriverPath] = useState([]);
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
        const duration = data.features[0].properties.summary?.duration || null;
        
        return {
          path: routeCoordinates,
          distance: distance ? (distance / 1000).toFixed(2) : null, // Convert to km and format
          duration: duration ? Math.round(duration / 60) : null // Convert to minutes
        };
      } else {
        console.error('Unexpected API response structure:', data);
        return {
          path: [startCoords, endCoords],
          distance: calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]).toFixed(2),
          duration: null
        };
      }
    } catch (error) {
      console.error('Error fetching driving route:', error);
      // Return a straight line as fallback and calculate distance
      return {
        path: [startCoords, endCoords],
        distance: calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]).toFixed(2),
        duration: null
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
      setRouteSegments([]);
      setMapBounds([]);
      setCustomerDistances({});
      setRouteStops([]);
      setDriverPath([]);
      setIsLoading(false);
      return;
    }

    // Create a collection of all points for bounds calculation
    let allPoints = [[selectedWarehouse.latitude, selectedWarehouse.longitude]];
    
    // Store distances from warehouse to each customer
    const distances = {};
    
    // Create optimized route using nearest neighbor algorithm
    const optimizedRoute = await createOptimizedRoute(selectedWarehouse, customersWithOrders);
    
    // Store the driver's path (sequential point-to-point route)
    setDriverPath(optimizedRoute.path);
    
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
    
    // Add all customers to stops in the optimized sequence
    if (optimizedRoute.stopSequence) {
      optimizedRoute.stopSequence.forEach((customer, index) => {
        stops.push({
          type: 'waypoint',
          number: index + 1,
          name: customer.name,
          location: [customer.latitude, customer.longitude],
          description: `Delivery Point ${index + 1}`,
          distance: optimizedRoute.segmentDistances[index] + ' km',
          duration: optimizedRoute.segmentDurations[index] ? 
            `${optimizedRoute.segmentDurations[index]} min` : 'N/A',
          estimatedArrival: calculateEstimatedArrival(index, optimizedRoute.segmentDurations)
        });
        
        // Add to bounds and distances
        allPoints.push([customer.latitude, customer.longitude]);
        distances[customer.id] = optimizedRoute.directDistances[customer.id];
      });
    }
    
    // Set the bounds for auto-zooming
    setMapBounds(allPoints);
    
    // Store all customer distances
    setCustomerDistances(distances);
    
    // Store route segments data
    setRouteSegments(optimizedRoute.segments);
    
    // Set the route stops
    setRouteStops(stops);
    
    setIsLoading(false);
  };
  
  // Helper function to calculate estimated arrival time
  const calculateEstimatedArrival = (stopIndex, durations) => {
    if (!durations || durations.length === 0) return 'N/A';
    
    const now = new Date();
    let totalMinutes = 0;
    
    // Sum up all durations up to current stop
    for (let i = 0; i <= stopIndex; i++) {
      if (durations[i]) {
        totalMinutes += durations[i];
      }
    }
    
    // Add average time spent at each stop (e.g., 10 minutes per delivery)
    totalMinutes += stopIndex * 10;
    
    const arrivalTime = new Date(now.getTime() + totalMinutes * 60000);
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced routing algorithm using 2-opt optimization after nearest neighbor
const createOptimizedRoute = async (warehouse, customers) => {
  // If there are no customers, just return the warehouse point
  if (customers.length === 0) {
    return { 
      path: [[warehouse.latitude, warehouse.longitude]], 
      totalDistance: 0,
      stopSequence: [],
      segmentDistances: [],
      segmentDurations: [],
      segments: [],
      directDistances: {}
    };
  }

  // Create a distance matrix for all locations (warehouse + customers)
  const locations = [
    { id: 'warehouse', lat: warehouse.latitude, lng: warehouse.longitude, name: warehouse.name },
    ...customers.map(c => ({ id: c.id, lat: c.latitude, lng: c.longitude, name: c.name }))
  ];
  
  // Calculate all pairwise distances
  const distanceMatrix = {};
  const routeDataCache = {};
  
  // Pre-calculate all pairwise distances
  for (let i = 0; i < locations.length; i++) {
    const from = locations[i];
    distanceMatrix[from.id] = {};
    
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        distanceMatrix[from.id][from.id] = 0;
        continue;
      }
      
      const to = locations[j];
      const cacheKey = `${from.id}-${to.id}`;
      
      // If we've already calculated this route, use cached value
      if (routeDataCache[cacheKey]) {
        distanceMatrix[from.id][to.id] = parseFloat(routeDataCache[cacheKey].distance);
        continue;
      }
      
      const fromCoords = [from.lat, from.lng];
      const toCoords = [to.lat, to.lng];
      
      const routeData = await fetchDrivingRoute(fromCoords, toCoords);
      routeDataCache[cacheKey] = routeData;
      distanceMatrix[from.id][to.id] = parseFloat(routeData.distance);
    }
  }
  
  // Step 1: Create initial route using nearest neighbor
  let currentPoint = 'warehouse';
  let unvisited = customers.map(c => c.id);
  let tour = ['warehouse'];
  
  // Standard nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const customerId of unvisited) {
      const distance = distanceMatrix[currentPoint][customerId];
      if (distance < minDistance) {
        minDistance = distance;
        nearest = customerId;
      }
    }
    
    tour.push(nearest);
    currentPoint = nearest;
    unvisited = unvisited.filter(id => id !== nearest);
  }
  
  // Step 2: Apply 2-opt improvement
  let improved = true;
  let bestDistance = calculateTourDistance(tour, distanceMatrix);
  let iterations = 0;
  const MAX_ITERATIONS = 100; // Prevent infinite loops
  
  while (improved && iterations < MAX_ITERATIONS) {
    improved = false;
    iterations++;
    
    // Try swapping each possible pair of edges
    for (let i = 1; i < tour.length - 2; i++) {
      for (let j = i + 1; j < tour.length - 1; j++) {
        // Skip adjacent edges
        if (j === i + 1) continue;
        
        // Create new tour with 2-opt swap
        const newTour = twoOptSwap(tour, i, j);
        const newDistance = calculateTourDistance(newTour, distanceMatrix);
        
        // If new tour is better, keep it
        if (newDistance < bestDistance) {
          tour = newTour;
          bestDistance = newDistance;
          improved = true;
          break; // Restart with the new tour
        }
      }
      if (improved) break;
    }
  }
  
  // Helper function to calculate total tour distance
  function calculateTourDistance(tour, distMatrix) {
    let total = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      total += distMatrix[tour[i]][tour[i+1]];
    }
    return total;
  }
  
  // Helper function to perform 2-opt swap
  function twoOptSwap(route, i, j) {
    // Create new route array
    const newRoute = route.slice(0, i);
    
    // Add reversed segment
    const reversedSegment = route.slice(i, j+1).reverse();
    newRoute.push(...reversedSegment);
    
    // Add remaining segment
    newRoute.push(...route.slice(j+1));
    
    return newRoute;
  }
  
  // Step 3: Convert tour IDs back to actual locations and routes
  const stopSequence = [];
  const path = [];
  const segmentDistances = [];
  const segmentDurations = [];
  const segments = [];
  const directDistances = {};
  let totalDistance = 0;
  
  // Extract the customers in optimized sequence
  for (let i = 1; i < tour.length; i++) {
    const customerId = tour[i];
    const customer = customers.find(c => c.id === customerId);
    stopSequence.push(customer);
    
    // Get route data from cache
    const fromId = tour[i-1];
    const fromLoc = fromId === 'warehouse' ? warehouse : customers.find(c => c.id === fromId);
    const fromName = fromId === 'warehouse' ? warehouse.name : fromLoc.name;
    
    const cacheKey = `${fromId}-${customerId}`;
    const routeData = routeDataCache[cacheKey];
    
    // Calculate direct distances from warehouse to each customer
    if (fromId === 'warehouse') {
      directDistances[customerId] = routeData.distance;
    }
    
    // Add this segment to the path
    if (path.length === 0) {
      path.push(...routeData.path);
    } else {
      path.push(...routeData.path.slice(1)); // Skip first point to avoid duplicates
    }
    
    // Save segment information
    segmentDistances.push(routeData.distance);
    segmentDurations.push(routeData.duration);
    totalDistance += parseFloat(routeData.distance);
    
    // Add to segment collection for styling
    segments.push({
      path: routeData.path,
      type: fromId === 'warehouse' ? 'warehouse-to-customer' : 'customer-to-customer',
      startName: fromName,
      endName: customer.name,
      distance: routeData.distance,
      duration: routeData.duration,
      color: fromId === 'warehouse' ? '#0F3460' : '#1A508B',
      weight: fromId === 'warehouse' ? 5 : 4
    });
  }
  
  return {
    path,
    totalDistance: totalDistance.toFixed(2),
    stopSequence,
    segmentDistances,
    segmentDurations,
    segments,
    directDistances
  };
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
      <h2 className="text-xl font-semibold mb-4">Driver Delivery Route</h2>
      
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
            
            {/* Display route segments with smooth color gradient */}
            {routeSegments.map((segment, idx) => (
              <Polyline 
                key={`segment-${idx}`}
                positions={segment.path}
                color={segment.color}
                weight={segment.weight}
                opacity={0.9}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">Route Segment {idx + 1}</h3>
                    <p>From: {segment.startName}</p>
                    <p>To: {segment.endName}</p>
                    <p>Distance: {segment.distance} km</p>
                    {segment.duration && <p>Estimated Time: {segment.duration} min</p>}
                  </div>
                </Popup>
              </Polyline>
            ))}
            
            {/* Display sequence numbers for each stop */}
            {routeStops.map((stop, idx) => (
              <CircleMarker
                key={`stop-marker-${idx}`}
                center={stop.location}
                radius={stop.type === 'source' ? 8 : 6}
                fillColor={stop.type === 'source' ? '#003049' : '#D62828'}
                fillOpacity={0.9}
                stroke={true}
                color="white"
                weight={2}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{stop.type === 'source' ? 'Starting Point' : `Stop #${stop.number}`}</h3>
                    <p>{stop.name}</p>
                    <p>{stop.description}</p>
                    {stop.distance && <p>Distance: {stop.distance}</p>}
                    {stop.duration && <p>Travel Time: {stop.duration}</p>}
                    {stop.estimatedArrival && <p>Est. Arrival: {stop.estimatedArrival}</p>}
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
                    <p className="font-semibold mt-2">Starting Point</p>
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
                  stop.type === 'source' ? 'bg-blue-800' : 'bg-red-600'
                }`}>
                  {stop.number}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold">{stop.name}</div>
                  <div className="text-sm text-gray-600">{stop.description}</div>
                  <div className="grid grid-cols-2 gap-x-2 mt-1">
                    {stop.distance && (
                      <div className="text-sm text-gray-700">Distance: {stop.distance}</div>
                    )}
                    {stop.duration && (
                      <div className="text-sm text-gray-700">Travel time: {stop.duration}</div>
                    )}
                    {stop.estimatedArrival && (
                      <div className="text-sm text-gray-700">ETA: {stop.estimatedArrival}</div>
                    )}
                  </div>
                </div>
                {idx < routeStops.length - 1 && (
                  <div className="flex-shrink-0 text-gray-500">
                    ↓
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <span className="font-bold">Total Stops:</span> {routeStops.length} (including warehouse as starting point)
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
              <span>Warehouse (Starting Point)</span>
            </p>
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-6 h-6 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
              <span>Customer Locations (Delivery Points)</span>
            </p>
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-6 h-6 rounded-full border-2 border-white bg-blue-800 mr-2 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">0</span>
              <span>Stop Sequence Numbers</span>
            </p>
            <p className="text-sm flex items-center mb-2">
              <span className="inline-block w-16 h-2 bg-blue-900 mr-2 flex-shrink-0"></span>
              <span>Route From Warehouse</span>
            </p>
            <p className="text-sm flex items-center">
              <span className="inline-block w-16 h-2 bg-blue-700 mr-2 flex-shrink-0"></span>
              <span>Route Between Delivery Points</span>
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Driver Trip Summary</h3>
          {visibleCustomers.length > 0 ? (
            <div className="border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="font-medium">Starting point:</span> {selectedWarehouse?.name || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total deliveries:</span> {visibleCustomers.length}
                </div>
                {routeSegments.length > 0 && (
                  <>
                    <div className="text-sm">
                      <span className="font-medium">Total distance:</span> {
                        routeSegments.reduce((total, segment) => total + parseFloat(segment.distance), 0).toFixed(2)
                      } km
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Est. total time:</span> {
                        routeSegments.reduce((total, segment) => total + (segment.duration || 0), 0) + 
                        (visibleCustomers.length * 10) // Adding 10 min per stop for delivery time
                      } min
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Route optimization:</span> Using nearest neighbor algorithm for efficient point-to-point delivery
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-600 text-sm">
              No trip summary to display.
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