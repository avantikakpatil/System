import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api, { getAssignedOrders, getAvailableTrucks } from '../../services/api';

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

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
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
  const [trucks, setTrucks] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeSegments, setRouteSegments] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center on India
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level
  const [isLoading, setIsLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState([]);
  const [customerDistances, setCustomerDistances] = useState({});
  const [routeStops, setRouteStops] = useState([]);
  const [driverPath, setDriverPath] = useState([]);
  const [trucksWithOrders, setTrucksWithOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingSequence, setLoadingSequence] = useState([]);
  const [showLoadingSequence, setShowLoadingSequence] = useState(false); // Control popup visibility
  const [loadingSequenceMode, setLoadingSequenceMode] = useState('simple'); // 'simple', 'detailed'
  const [isPrintView, setIsPrintView] = useState(false);
  const mapRef = useRef(null);
  const printRef = useRef(null);

  useEffect(() => {
    // Fetch warehouses
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/warehouses');
        setWarehouses(response.data);
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

    // Fetch trucks and assigned orders - UPDATED with logic from AssignTruck component
    const fetchTrucksAndOrders = async () => {
      try {
        // Fetch all available trucks
        const availableTrucksData = await getAvailableTrucks();
        setTrucks(availableTrucksData);
        
        // Fetch orders that have been assigned to trucks
        let assignedOrdersData = await getAssignedOrders();
        
        // Enhanced assignedOrders with additional location data if needed
        const enhancedAssignedOrders = await Promise.all(
          assignedOrdersData.map(async (order) => {
            // If location data is missing, fetch complete order details
            if (!order.latitude || !order.longitude || !order.customerName) {
              try {
                // Try to get the complete order details
                const orderResponse = await api.get(`/orders/${order.id}`);
                const orderDetails = orderResponse.data;
                
                // If order details don't have location and we have a customerId, fetch customer
                if ((!orderDetails.latitude || !orderDetails.longitude) && orderDetails.customerId) {
                  try {
                    const customerResponse = await api.get(`/users/${orderDetails.customerId}`);
                    const customerDetails = customerResponse.data;
                    
                    return { 
                      ...order, 
                      ...orderDetails,
                      latitude: customerDetails.latitude,
                      longitude: customerDetails.longitude,
                      customerName: customerDetails.name || order.customerName
                    };
                  } catch (err) {
                    console.error(`Failed to fetch customer details for order ${order.id}:`, err);
                  }
                }
                
                return { ...order, ...orderDetails };
              } catch (err) {
                console.error(`Failed to fetch details for order ${order.id}:`, err);
                return order;
              }
            }
            return order;
          })
        );
        
        // Update assignedOrders with enhanced data and include warehouse details
        assignedOrdersData = await Promise.all(enhancedAssignedOrders
          .filter(order => order && (order.latitude || order.customerId))
          .map(async (order) => {
            // Fetch warehouse details if warehouseId exists
            if (order.warehouseId) {
              try {
                const warehouseResponse = await api.get(`/warehouses/${order.warehouseId}`);
                const warehouseDetails = warehouseResponse.data;
                return {
                  ...order,
                  warehouseName: warehouseDetails.Name,
                  warehouseLatitude: warehouseDetails.Latitude,
                  warehouseLongitude: warehouseDetails.Longitude,
                  warehouseAddress: warehouseDetails.Address
                };
              } catch (err) {
                console.error(`Failed to fetch warehouse details for order ${order.id}:`, err);
                return order;
              }
            }
            return order;
          })
        );
        
        setAssignedOrders(assignedOrdersData);
        
        // Create a list of trucks that have orders assigned to them
        const uniqueTrucksWithOrders = [];
        const truckIds = new Set();
        
        assignedOrdersData.forEach(order => {
          if (order.truckId && !truckIds.has(order.truckId)) {
            const truck = availableTrucksData.find(t => t.id === order.truckId);
            if (truck) {
              truckIds.add(order.truckId);
              uniqueTrucksWithOrders.push(truck);
            }
          }
        });
        
        setTrucksWithOrders(uniqueTrucksWithOrders);
        
        // Select the first truck with orders by default if available
        if (uniqueTrucksWithOrders.length > 0) {
          setSelectedTruck(uniqueTrucksWithOrders[0]);
        }
      } catch (error) {
        console.error('Error fetching trucks and assigned orders:', error);
      }
    };

    // Fetch all orders
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        
        // Create a dictionary of order details indexed by order ID
        const orderDetailsDict = {};
        response.data.forEach(order => {
          orderDetailsDict[order.id] = order;
        });
        setOrderDetails(orderDetailsDict);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchWarehouses();
    fetchCustomers();
    fetchTrucksAndOrders(); // UPDATED: use the new combined function
    fetchOrders();
  }, []);

  useEffect(() => {
    // Set the warehouse based on selected truck's orders
    if (selectedTruck && assignedOrders.length > 0) {
      const truckOrders = assignedOrders.filter(order => order.truckId === selectedTruck.id);
      
      if (truckOrders.length > 0) {
        // Get the warehouse from the first order
        const firstOrder = truckOrders[0];
        
        // Find the warehouse in warehouses array or create it from order data
        if (firstOrder.warehouseId) {
          const warehouse = warehouses.find(w => w.id === firstOrder.warehouseId);
          
          if (warehouse) {
            setSelectedWarehouse(warehouse);
          } else if (firstOrder.warehouseLatitude && firstOrder.warehouseLongitude) {
            // Create warehouse object from order data if not found in warehouses array
            setSelectedWarehouse({
              id: firstOrder.warehouseId,
              name: firstOrder.warehouseName || 'Warehouse',
              location: firstOrder.warehouseAddress || 'Address not available',
              latitude: firstOrder.warehouseLatitude,
              longitude: firstOrder.warehouseLongitude
            });
          }
        }
      }
    }
  }, [selectedTruck, assignedOrders, warehouses]);

  useEffect(() => {
    // Create delivery routes when truck, warehouse and customers are loaded
    if (selectedTruck && selectedWarehouse && (customers.length > 0 || assignedOrders.length > 0)) {
      createDeliveryRoutes();
    }
  }, [selectedTruck, selectedWarehouse, customers, assignedOrders]);

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
    
    // Get customers with orders assigned to the selected truck and from the selected warehouse
    // UPDATED: Use visibleCustomers function to get proper customer data
    const customersWithOrders = getVisibleCustomers();
    
    if (customersWithOrders.length === 0) {
      setRoutePath([]);
      setRouteSegments([]);
      setMapBounds([]);
      setCustomerDistances({});
      setRouteStops([]);
      setDriverPath([]);
      setLoadingSequence([]);
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
          estimatedArrival: calculateEstimatedArrival(index, optimizedRoute.segmentDurations),
          orderId: customer.orderId, // Store the orderId for loading sequence
          customerId: customer.id // Store the customerId for loading sequence
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
    
    // Create loading sequence based on route stops
    generateLoadingSequence(stops);
    
    setIsLoading(false);
  };

  // Generate loading sequence based on the optimized delivery route
  const generateLoadingSequence = (stops) => {
    // Skip the warehouse (first stop)
    const deliveryStops = stops.slice(1);
    
    // We want to load the truck in reverse order of delivery
    // So that the first deliveries are loaded last (closest to the truck door)
    const reversedStops = [...deliveryStops].reverse();
    
    const sequence = reversedStops.map((stop, index) => {
      // Get the order details for this stop
      const orderInfo = orderDetails[stop.orderId] || 
                        assignedOrders.find(o => o.id === stop.orderId);
      
      // Get the customer details - IMPROVED LOGIC HERE
      const customerInfo = customers.find(c => c.id === stop.customerId) || {};
      
      // Find the original assigned order with potentially more complete data
      const assignedOrder = assignedOrders.find(o => o.id === stop.orderId);
      
      // Determine the best customer name to use
      const customerName = stop.name || // First try the stop name from the route calculation
                          assignedOrder?.customerName || // Then try customer name from assigned order
                          customerInfo?.name || // Then customer name from the customer object
                          `Customer for Order #${stop.orderId}`; // Fallback
      
      return {
        loadingPosition: index + 1, // Loading position (1-based)
        deliveryPosition: stops.length - index - 1, // Delivery position (from the end)
        orderId: stop.orderId,
        customerName: customerName,
        customerLocation: customerInfo.location || assignedOrder?.customerAddress || 'Unknown Location',
        orderItems: orderInfo?.items || orderInfo?.orderItems || [],
        // Add additional product details if available
        productDetails: orderInfo?.products || [],
        estimatedArrival: stop.estimatedArrival
      };
    });
    
    setLoadingSequence(sequence);
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

  const handleTruckChange = (truck) => {
    setSelectedTruck(truck);
  };

  // UPDATED: Modified function to properly handle location data
  const getVisibleCustomers = () => {
    if (!selectedWarehouse || !selectedTruck || !assignedOrders.length) return [];
    
    // First get all assigned orders for this truck and warehouse
    const relevantOrders = assignedOrders.filter(order => 
      order.warehouseId === selectedWarehouse.id && 
      order.truckId === selectedTruck.id
    );
    
    // Then map these to actual customer objects with location data
    return relevantOrders.map(order => {
      // Try to find the customer in our customers list
      const customer = customers.find(c => c.id === order.customerId);
      
      // If we found the customer and they have location data
      if (customer && customer.latitude && customer.longitude) {
        return {
          ...customer,
          orderId: order.id
        };
      }
      
      // If customer exists but missing location data, use order's location data
      if (customer) {
        return {
          ...customer,
          latitude: order.latitude || customer.latitude,
          longitude: order.longitude || customer.longitude,
          orderId: order.id
        };
      }
      
      // If no customer found, create one from order data
      return {
        id: order.customerId || `order-${order.id}`,
        name: order.customerName || `Customer for Order #${order.id}`,
        email: order.customerEmail || '',
        location: order.customerAddress || '',
        latitude: order.latitude,
        longitude: order.longitude,
        orderId: order.id
      };
    }).filter(customer => customer && customer.latitude && customer.longitude);
  };

  // Toggle loading sequence popup
  const toggleLoadingSequence = () => {
    setShowLoadingSequence(!showLoadingSequence);
  };

  // Toggle between simple and detailed loading sequence view
  const toggleSequenceMode = () => {
    setLoadingSequenceMode(loadingSequenceMode === 'simple' ? 'detailed' : 'simple');
  };

  // Helper to print loading sequence
  const printLoadingSequence = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 500);
  };

  // Close the loading sequence popup
  const closeLoadingSequence = () => {
    setShowLoadingSequence(false);
  };

  const visibleCustomers = getVisibleCustomers();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Driver Delivery Route</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Truck:
        </label>
        <select 
          className="w-full border border-gray-300 rounded-md p-2"
          value={selectedTruck?.id || ''}
          onChange={(e) => {
            const selected = trucks.find(t => t.id.toString() === e.target.value);
            handleTruckChange(selected);
          }}
        >
          <option value="">-- Select a Truck --</option>
          {trucksWithOrders.map(truck => (
            <option key={truck.id} value={truck.id}>
              {truck.number || truck.truckNumber} - Driver: {truck.driverName}
            </option>
          ))}
        </select>
        {trucksWithOrders.length === 0 && (
          <p className="mt-1 text-sm text-red-500">No trucks with assigned orders available.</p>
        )}
      </div>
      
      {/* Display warehouse info for the selected truck */}
      {selectedWarehouse && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">Warehouse Information</h3>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Name:</span> {selectedWarehouse.name}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Location:</span> {selectedWarehouse.location || 'Location not available'}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Coordinates:</span> {selectedWarehouse.latitude}, {selectedWarehouse.longitude}
            </div>
          </div>
        </div>
      )}
      
      {/* Display assigned orders for the selected truck */}
      {selectedTruck && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Selected Truck Information</h3>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Truck Number:</span> {selectedTruck.number || selectedTruck.truckNumber}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Driver Name:</span> {selectedTruck.driverName}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">License Number:</span> {selectedTruck.licenseNumber || 'N/A'}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Phone Number:</span> {selectedTruck.phoneNumber || 'N/A'}
            </div>
          </div>
          
          {/* Display assigned orders for this truck */}
          <div className="mt-3">
            <h4 className="font-medium text-green-800">Assigned Orders:</h4>
            <ul className="text-sm text-gray-700 mt-1">
              {assignedOrders.filter(order => order.truckId === selectedTruck.id).map(order => (
                <li key={`order-${order.id}`} className="py-1">
                  Order #{order.id} - {order.customerName || 'Customer'}
                  {order.warehouseName && ` (from ${order.warehouseName})`}
                </li>
              ))}
              {assignedOrders.filter(order => order.truckId === selectedTruck.id).length === 0 && (
                <li className="py-1 italic">No orders assigned to this truck.</li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div className="h-96 w-full relative mb-4" ref={mapRef}>
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
            className="rounded-lg shadow-md"
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
                    <p>{selectedWarehouse.location || 'Location not available'}</p>
                    <p className="font-semibold mt-2">Starting Point</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Display customers with orders from the selected warehouse and assigned to selected truck */}
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
            
            {/* Display truck's current position if available */}
            {selectedTruck && selectedTruck.currentLatitude && selectedTruck.currentLongitude && (
              <Marker
                position={[selectedTruck.currentLatitude, selectedTruck.currentLongitude]}
                icon={truckIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">Truck {selectedTruck.number || selectedTruck.truckNumber}</h3>
                    <p>Driver: {selectedTruck.driverName}</p>
                    <p>Phone: {selectedTruck.phoneNumber || 'N/A'}</p>
                    <p className="font-semibold mt-2">Current Location</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
  
      {/* Route information panel */}
      {routeStops.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Delivery Route Information</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 bg-blue-100 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Stop</th>
                  <th className="px-3 py-2 bg-blue-100 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-2 bg-blue-100 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Distance</th>
                  <th className="px-3 py-2 bg-blue-100 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Travel Time</th>
                  <th className="px-3 py-2 bg-blue-100 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Est. Arrival</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routeStops.map((stop, idx) => (
                  <tr key={`route-stop-${idx}`} className={idx === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stop.number === 0 ? 'Start' : `Stop ${stop.number}`}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {stop.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {stop.distance || 'N/A'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {stop.duration || 'N/A'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {stop.estimatedArrival || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Total route summary */}
          <div className="mt-4 p-3 bg-white shadow-sm rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Distance</p>
                <p className="text-lg font-bold text-blue-800">
                  {routeSegments.reduce((sum, segment) => sum + parseFloat(segment.distance), 0).toFixed(2)} km
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Estimated Travel Time</p>
                <p className="text-lg font-bold text-blue-800">
                  {routeSegments.reduce((sum, segment) => sum + (segment.duration || 0), 0)} min
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Number of Deliveries</p>
                <p className="text-lg font-bold text-blue-800">
                  {routeStops.length - 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Loading Sequence - Always Displayed */}
      {loadingSequence.length > 0 && (
        <div className="mb-6 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              Loading Sequence for {selectedTruck?.number || selectedTruck?.truckNumber}
            </h3>
            <p className="text-indigo-100 text-sm">
              Items should be loaded in reverse order (last delivery items first, first delivery items last)
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="bg-indigo-50 text-indigo-800 py-3 px-4 border-b border-indigo-100 text-left text-xs font-semibold uppercase tracking-wider">
                    Loading Order
                  </th>
                  <th className="bg-indigo-50 text-indigo-800 py-3 px-4 border-b border-indigo-100 text-left text-xs font-semibold uppercase tracking-wider">
                    Delivery Order
                  </th>
                  <th className="bg-indigo-50 text-indigo-800 py-3 px-4 border-b border-indigo-100 text-left text-xs font-semibold uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="bg-indigo-50 text-indigo-800 py-3 px-4 border-b border-indigo-100 text-left text-xs font-semibold uppercase tracking-wider">
                    Est. Arrival
                  </th>
                  <th className="bg-indigo-50 text-indigo-800 py-3 px-4 border-b border-indigo-100 text-left text-xs font-semibold uppercase tracking-wider">
                    Order Items
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingSequence.map((item, index) => (
                  <tr 
                    key={`loading-${index}`} 
                    className={`border-b border-gray-200 hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 text-center font-medium text-gray-900">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                        {item.loadingPosition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 font-bold">
                        {item.deliveryPosition}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {item.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{item.estimatedArrival}</span>
                    </td>
                    <td className="py-3 px-4">
                      {item.orderItems && item.orderItems.length > 0 ? (
                        <div className="space-y-1">
                          {item.orderItems.map((orderItem, itemIndex) => (
                            <div 
                              key={`item-${itemIndex}`} 
                              className="flex items-center py-1 px-2 bg-white rounded-md border border-gray-200"
                            >
                              <div className="h-4 w-4 bg-indigo-100 rounded-full text-indigo-800 flex items-center justify-center text-xs font-bold mr-2">
                                {orderItem.quantity || 1}
                              </div>
                              <span className="text-sm">{orderItem.productName || orderItem.name || 'Product'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No items data available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-indigo-50 px-6 py-4">
            <p className="text-sm text-indigo-800 font-medium">
              Note: The loading sequence is optimized to minimize delivery time and effort when unloading.
            </p>
          </div>
        </div>
      )}
      
      {/* No routes message */}
      {routeStops.length === 0 && selectedTruck && selectedWarehouse && !isLoading && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">
            No delivery routes found for this truck and warehouse combination. 
            Please ensure that there are assigned orders for the selected truck from the selected warehouse.
          </p>
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-center mb-3">Calculating optimal route...</p>
            <div className="loader h-2 w-64 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;