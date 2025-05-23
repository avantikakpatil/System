import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Fetch Order Error:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    try {
      const response = await api.put(`/orders/${id}/status`, { status: newStatus });
      
      // Update the entire order object with the response
      setOrder(response.data);
    } catch (err) {
      console.error('Status Update Error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
  
      setError(
        err.response?.data?.message || 
        (err.response?.data?.errors 
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err.message)
      );
    }
  };

  const parseAddress = (addressString) => {
    // If it's already an object, return it
    if (typeof addressString === 'object' && addressString !== null) {
      return addressString;
    }
  
    // If it's a string, try to parse or return as is
    try {
      // Attempt to parse if it looks like JSON
      return JSON.parse(addressString);
    } catch {
      // If not JSON, return the full string
      return { 
        street: addressString 
      };
    }
  };

  const openMap = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  const getStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
    </div>
  );

  if (!order) return (
    <div className="text-center py-8 text-gray-500">
      No order details found
    </div>
  );

  // Parse shipping address
  const shippingAddress = parseAddress(order.shippingAddress);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Back to Orders
          </button>
        </div>

        {/* Order Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Customer and Shipping Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-900 font-semibold text-lg">
                {order.customerName || 'N/A'}
              </p>

              <h4 className="text-sm font-medium text-gray-600 mt-2">Shipping Address</h4>
              {shippingAddress.street && (
                <p className="text-gray-900">{shippingAddress.street}</p>
              )}
              {(shippingAddress.city || shippingAddress.state || shippingAddress.postalCode) && (
                <p className="text-gray-900">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
              )}
              {shippingAddress.country && (
                <p className="text-gray-900">{shippingAddress.country}</p>
              )}
              
              {/* Latitude and Longitude */}
              {(order.latitude !== 0 && order.longitude !== 0) && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Location</h4>
                  <button 
                    onClick={() => openMap(order.latitude, order.longitude)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <span>
                      Lat: {order.latitude?.toFixed(6) || 'N/A'}, 
                      Lng: {order.longitude?.toFixed(6) || 'N/A'}
                    </span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Information Column */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.orderDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
              {order.notes && (
                <div className="mt-2">
                  <span className="text-gray-600">Notes:</span>
                  <p className="text-sm text-gray-800">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse Details Section */}
        {order.warehouseId && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Dispatch Warehouse</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-900 font-semibold text-lg">
                {order.warehouseName || 'N/A'}
              </p>
              <p className="text-gray-900">{order.warehouseAddress}</p>

              {/* Warehouse Location Map Button */}
              {order.warehouseLatitude !== undefined && order.warehouseLongitude !== undefined && 
               order.warehouseLatitude !== null && order.warehouseLongitude !== null &&
               (order.warehouseLatitude !== 0 || order.warehouseLongitude !== 0) && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Warehouse Location</h4>
                  <button 
                    onClick={() => openMap(order.warehouseLatitude, order.warehouseLongitude)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <span>
                      Lat: {order.warehouseLatitude?.toFixed(6) || 'N/A'}, 
                      Lng: {order.warehouseLongitude?.toFixed(6) || 'N/A'}
                    </span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Update Section */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Update Order Status</h3>
          <div className="flex items-center space-x-4">
            <select
              value={order.orderStatus}
              onChange={handleStatusChange}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200">
          <div className="px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {order.orderItems.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">ID: {item.productId}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-green-600">${item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;