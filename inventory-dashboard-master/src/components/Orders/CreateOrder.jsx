import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    warehouseId: '', // Make sure this is initialized
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, productsResponse, warehousesResponse] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
          api.get('/warehouses'),
        ]);
        
        setCustomers(customersResponse.data);
        setProducts(productsResponse.data.filter(product => product.isActive));
        setWarehouses(warehousesResponse.data.filter(warehouse => warehouse.isActive));
      } catch (err) {
        console.error('Fetch Data Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProductSelection = (e) => {
    const productId = parseInt(e.target.value);
    if (productId && !selectedProducts.some(item => item.productId === productId)) {
      const product = products.find(p => p.id === productId);
      setSelectedProducts([
        ...selectedProducts, 
        { 
          productId: product.id, 
          productName: product.name, 
          price: product.price, 
          quantity: 1 
        }
      ]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = quantity;
    setSelectedProducts(updatedProducts);
  };

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }
    
    if (selectedProducts.length === 0) {
      setError('Please add at least one product');
      return;
    }
    
    try {
      // Important: Make sure warehouseId is either a number or null
      const orderData = {
        CustomerId: parseInt(formData.customerId),
        WarehouseId: formData.warehouseId ? parseInt(formData.warehouseId) : null,
        Notes: formData.notes,
        OrderItems: selectedProducts.map(item => ({
          ProductId: item.productId,
          Quantity: item.quantity
        }))
      };
      
      console.log('Order Data:', orderData);
      
      const response = await api.post('/orders', orderData);
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      console.error('Create Order Error:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-6 rounded" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="customerId">
                Customer
              </label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Warehouse Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="warehouseId">
                Dispatch Warehouse
              </label>
              <select
                id="warehouseId"
                name="warehouseId"
                value={formData.warehouseId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.address})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Notes Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                Order Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          {/* Product Selection Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Products</h2>
            
            {/* Product Dropdown */}
            <div className="mb-4">
              <select
                onChange={handleProductSelection}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value=""
              >
                <option value="">Select a product to add</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Products Table */}
            {selectedProducts.length > 0 && (
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-4 text-right font-medium">Total Amount:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ${selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;