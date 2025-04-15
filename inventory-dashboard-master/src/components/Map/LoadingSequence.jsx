import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api, { getAssignedOrders, getAvailableTrucks } from '../../services/api';

const LoadingSequence = () => {
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);
  const [optimizedItems, setOptimizedItems] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState({});
  const [showOptimized, setShowOptimized] = useState(false);
  const [truckCapacity, setTruckCapacity] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  

useEffect(() => {
  // Fetch trucks and assigned orders
  const fetchTrucksAndOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all available trucks
      const availableTrucksData = await getAvailableTrucks();
      
      // Fetch orders that have been assigned to trucks
      const assignedOrdersData = await getAssignedOrders();
      
      // Enhanced logging to debug the issue
      console.log("Available trucks:", availableTrucksData);
      console.log("Assigned orders:", assignedOrdersData);
      
      // Create a list of trucks that have orders assigned to them
      const trucksWithOrders = [];
      const truckIds = new Set();
      
      // More robust way to match trucks with orders
      assignedOrdersData.forEach(order => {
        if (order.truckId) {
          // Convert IDs to strings for comparison if needed
          const truckId = typeof order.truckId === 'string' ? 
            order.truckId : order.truckId.toString();
            
          if (!truckIds.has(truckId)) {
            // Find the truck by ID, comparing as strings to avoid type issues
            const truck = availableTrucksData.find(t => 
              t.id.toString() === truckId
            );
            
            if (truck) {
              truckIds.add(truckId);
              trucksWithOrders.push(truck);
            }
          }
        }
      });
      
      console.log("Trucks with orders:", trucksWithOrders);
      
      setTrucks(trucksWithOrders);
      setAssignedOrders(assignedOrdersData);
      
      // Select the first truck with orders by default if available
      if (trucksWithOrders.length > 0) {
        setSelectedTruck(trucksWithOrders[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trucks and assigned orders:', error);
      setIsLoading(false);
    }
  };

  fetchTrucksAndOrders();
}, []);

useEffect(() => {
  // When a truck is selected, fetch the warehouse and order details
  const fetchWarehouseAndOrderDetails = async () => {
    if (!selectedTruck) {
      console.log("No truck selected");
      return;
    }
    
    setIsLoading(true);
    console.log("Selected truck:", selectedTruck);
    
    try {
      // Find orders assigned to this truck
      const truckOrders = assignedOrders.filter(order => 
        order.truckId === selectedTruck.id || 
        order.truckId === selectedTruck.id.toString()
      );
      
      console.log("Truck orders:", truckOrders);
      
      if (truckOrders.length === 0) {
        console.log("No orders found for this truck");
        setOrderedItems([]);
        setWarehouse(null);
        setIsLoading(false);
        return;
      }
      
      // Rest of your code for fetching warehouse and order details...
        
        // Fetch warehouse from first order
        const firstOrder = truckOrders[0];
        
        if (firstOrder.warehouseId) {
          try {
            const warehouseResponse = await api.get(`/warehouses/${firstOrder.warehouseId}`);
            setWarehouse(warehouseResponse.data);
          } catch (err) {
            console.error(`Failed to fetch warehouse details:`, err);
          }
        }
        
        // Fetch detailed order information for each order
        const detailedOrders = await Promise.all(
          truckOrders.map(async (order) => {
            try {
              const orderResponse = await api.get(`/orders/${order.id}`);
              const orderDetails = orderResponse.data;
              
              // Fetch customer information if available
              let customerName = orderDetails.customerName || order.customerName;
              let customerAddress = orderDetails.customerAddress || order.customerAddress;
              
              if (orderDetails.customerId) {
                try {
                  const customerResponse = await api.get(`/users/${orderDetails.customerId}`);
                  const customerDetails = customerResponse.data;
                  customerName = customerDetails.name || customerName;
                  customerAddress = customerDetails.address || customerAddress;
                } catch (err) {
                  console.error(`Failed to fetch customer details:`, err);
                }
              }
              
              // Extract order items
              const orderItems = orderDetails.items || [];
              
              // Add customer and location data to each item
              const itemsWithDetails = orderItems.map(item => ({
                ...item,
                orderId: order.id,
                customerName,
                customerAddress,
                latitude: orderDetails.latitude || order.latitude,
                longitude: orderDetails.longitude || order.longitude,
                // Default values for weight and dimensions if not available
                weight: item.weight || 1, // kg
                width: item.width || 0.3, // m
                height: item.height || 0.3, // m
                depth: item.depth || 0.3, // m
              }));
              
              return itemsWithDetails;
            } catch (err) {
              console.error(`Failed to fetch details for order ${order.id}:`, err);
              return [];
            }
          })
        );
        
        // Flatten the array of arrays
        const allItems = detailedOrders.flat();
        
        // Sort items by order ID (or any other default ordering)
        const sortedItems = allItems.sort((a, b) => a.orderId - b.orderId);
        
        // Calculate total weight and volume
        let weight = 0;
        let volume = 0;
        
        sortedItems.forEach(item => {
          weight += (item.weight || 1) * (item.quantity || 1);
          volume += (item.width || 0.3) * (item.height || 0.3) * (item.depth || 0.3) * (item.quantity || 1);
        });
        
        setTotalWeight(weight.toFixed(2));
        setTotalVolume(volume.toFixed(2));
        
        // Set truck capacity (example values if not available)
        setTruckCapacity(selectedTruck.maxWeight || 1000);
        
        setOrderedItems(sortedItems);
        optimizeLoadingSequence(sortedItems);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setIsLoading(false);
      }
    };
    
    fetchWarehouseAndOrderDetails();
  }, [selectedTruck, assignedOrders]);

  // Function to optimize loading sequence based on delivery route and item properties
  const optimizeLoadingSequence = async (items) => {
    if (!items || items.length === 0) {
      setOptimizedItems([]);
      return;
    }
    
    try {
      // Check if we have customer locations for route optimization
      const itemsWithLocations = items.filter(item => item.latitude && item.longitude);
      
      if (itemsWithLocations.length === 0) {
        // If no location data, optimize based on weight (heavier items last)
        const weightSorted = [...items].sort((a, b) => {
          const weightA = (a.weight || 1) * (a.quantity || 1);
          const weightB = (b.weight || 1) * (b.quantity || 1);
          return weightA - weightB; // Lighter items first
        });
        
        setOptimizedItems(weightSorted);
        return;
      }
      
      // Try to get route data from the backend API (if available)
      try {
        // Example API call to get the optimized route from warehouse to customers
        const routeResponse = await api.get(`/delivery-routes?truckId=${selectedTruck.id}`);
        const routeData = routeResponse.data;
        
        if (routeData && routeData.stopSequence) {
          // Use the delivery sequence to optimize loading (last delivery loaded first)
          const stopSequence = routeData.stopSequence;
          const orderedByDelivery = [];
          
          // Start from the end of the delivery sequence (last delivery first)
          for (let i = stopSequence.length - 1; i >= 0; i--) {
            const stop = stopSequence[i];
            
            // Find items for this customer
            const customerItems = items.filter(item => {
              // Match by coordinates (approximate)
              const latDiff = Math.abs((item.latitude || 0) - (stop.location[0] || 0));
              const lngDiff = Math.abs((item.longitude || 0) - (stop.location[1] || 0));
              return latDiff < 0.01 && lngDiff < 0.01; // Small threshold for coordinate matching
            });
            
            // Add items to the ordered list
            orderedByDelivery.push(...customerItems);
          }
          
          // Add any remaining items
          const remainingItems = items.filter(item => 
            !orderedByDelivery.some(oi => oi.id === item.id)
          );
          
          orderedByDelivery.push(...remainingItems);
          
          setOptimizedItems(orderedByDelivery);
          return;
        }
      } catch (err) {
        console.warn('Route data not available, using fallback optimization', err);
      }
      
      // Fallback: Calculate approximate distances from warehouse
      if (warehouse && warehouse.Latitude && warehouse.Longitude) {
        // Group items by customer location
        const customerGroups = {};
        
        items.forEach(item => {
          if (!item.latitude || !item.longitude) return;
          
          const key = `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`;
          
          if (!customerGroups[key]) {
            // Calculate distance from warehouse using Haversine formula
            const distance = calculateDistance(
              warehouse.Latitude, 
              warehouse.Longitude,
              item.latitude,
              item.longitude
            );
            
            customerGroups[key] = {
              items: [],
              distance
            };
          }
          
          customerGroups[key].items.push(item);
        });
        
        // Sort customer groups by distance (farthest first for loading)
        const sortedGroups = Object.values(customerGroups).sort((a, b) => b.distance - a.distance);
        
        // Flatten the groups to get items in order (farthest customer first)
        const optimized = sortedGroups.flatMap(group => group.items);
        
        // Add any items without location data at the end
        const itemsWithoutLocation = items.filter(item => !item.latitude || !item.longitude);
        
        setOptimizedItems([...optimized, ...itemsWithoutLocation]);
      } else {
        // No warehouse location, sort by weight as fallback
        const weightSorted = [...items].sort((a, b) => {
          const weightA = (a.weight || 1) * (a.quantity || 1);
          const weightB = (b.weight || 1) * (b.quantity || 1);
          return weightA - weightB; // Lighter items first
        });
        
        setOptimizedItems(weightSorted);
      }
    } catch (error) {
      console.error('Error optimizing loading sequence:', error);
      // Fallback - use original order
      setOptimizedItems([...items]);
    }
  };

  // Haversine distance calculation
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

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = showOptimized ? [...optimizedItems] : [...orderedItems];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    if (showOptimized) {
      setOptimizedItems(items);
    } else {
      setOrderedItems(items);
    }
  };

  // Generate loading plan based on truck type and item dimensions
  const generateLoadingPlan = () => {
    // Simplified loading plan algorithm
    const items = showOptimized ? optimizedItems : orderedItems;
    
    // Group items by order
    const orderGroups = {};
    
    items.forEach(item => {
      if (!orderGroups[item.orderId]) {
        orderGroups[item.orderId] = {
          orderId: item.orderId,
          customerName: item.customerName,
          customerAddress: item.customerAddress,
          items: []
        };
      }
      
      orderGroups[item.orderId].items.push(item);
    });
    
    setLoadingPlan(orderGroups);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Loading Sequence Planner</h2>
      
      {/* Truck selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Truck:
        </label>
        <select 
          className="w-full border border-gray-300 rounded-md p-2"
          value={selectedTruck?.id || ''}
          onChange={(e) => {
            const selected = trucks.find(t => t.id.toString() === e.target.value);
            setSelectedTruck(selected);
          }}
        >
          <option value="">-- Select a Truck --</option>
          {trucks.map(truck => (
            <option key={truck.id} value={truck.id}>
              {truck.number || truck.truckNumber} - Driver: {truck.driverName}
            </option>
          ))}
        </select>
        {trucks.length === 0 && (
          <p className="mt-1 text-sm text-red-500">No trucks with assigned orders available.</p>
        )}
      </div>
      
      {/* Warehouse and truck info */}
      {selectedTruck && warehouse && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">Warehouse Information</h3>
            <div className="mt-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {warehouse.Name}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Location:</span> {warehouse.Address}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Truck Information</h3>
            <div className="mt-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Truck Number:</span> {selectedTruck.number || selectedTruck.truckNumber}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Driver:</span> {selectedTruck.driverName}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Capacity:</span> {truckCapacity} kg
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Current Load:</span> {totalWeight} kg ({Math.round((totalWeight / truckCapacity) * 100)}%)
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading options */}
      {orderedItems.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded ${!showOptimized ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setShowOptimized(false)}
          >
            Original Order
          </button>
          <button
            className={`px-4 py-2 rounded ${showOptimized ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setShowOptimized(true)}
          >
            Optimized Loading
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white ml-auto"
            onClick={generateLoadingPlan}
          >
            Generate Loading Plan
          </button>
        </div>
      )}
      
      {/* Items to load - Drag and drop interface */}
      {(orderedItems.length > 0 && !isLoading) ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {showOptimized ? 'Optimized Loading Sequence' : 'Current Loading Sequence'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {showOptimized ? 
              'Items are ordered based on delivery sequence (last delivery first) and item properties.' : 
              'Items are ordered based on original order sequence.'}
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  className="bg-gray-50 p-3 border rounded"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {(showOptimized ? optimizedItems : orderedItems).map((item, index) => (
                    <Draggable key={`item-${item.id}-${index}`} draggableId={`item-${item.id}-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-2 rounded border shadow-sm hover:shadow-md cursor-move"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-800 font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.name || `Product #${item.id}`}</h4>
                                <p className="text-sm text-gray-600">
                                  Order #{item.orderId} • {item.customerName || 'Customer'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">Qty: {item.quantity || 1}</div>
                              <div className="text-sm text-gray-600">
                                {item.weight ? `${(item.weight * (item.quantity || 1)).toFixed(1)} kg` : 'Weight N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading order data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-800">
            No orders assigned to this truck or no truck selected.
          </p>
        </div>
      )}
      
      {/* Loading Plan Display */}
      {Object.keys(loadingPlan).length > 0 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Loading Plan</h3>
          
          <div className="space-y-4">
            {Object.values(loadingPlan).map((orderGroup, groupIndex) => (
              <div key={`order-group-${orderGroup.orderId}`} className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium text-blue-700 border-b pb-1 mb-2">
                  Order #{orderGroup.orderId} - {orderGroup.customerName}
                </h4>
                <p className="text-sm text-gray-600 mb-2">{orderGroup.customerAddress}</p>
                
                <h5 className="font-medium text-sm">Items to load:</h5>
                <ul className="mt-1 space-y-1">
                  {orderGroup.items.map((item, itemIndex) => (
                    <li key={`plan-item-${item.id}-${itemIndex}`} className="text-sm flex justify-between items-center">
                      <span>{item.name || `Product #${item.id}`}</span>
                      <span className="font-medium">Qty: {item.quantity || 1}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-2 pt-2 border-t text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Total Items: {orderGroup.items.length}</span>
                    <span>
                      Total Weight: {orderGroup.items.reduce((sum, item) => sum + ((item.weight || 1) * (item.quantity || 1)), 0).toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Loading Instructions:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Load items in the order shown above (top to bottom)</li>
              <li>Keep items from the same order together when possible</li>
              <li>Heavier items should be placed at the bottom of each stack</li>
              <li>Fragile items should be secured and not have items stacked on top</li>
              <li>Ensure all items are properly secured before departure</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSequence;