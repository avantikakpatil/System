import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';



const CreateOrder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
        ]);
        
        console.log('Users Data:', customersResponse.data);
        
        // Since there's no explicit "role" column, we'll just use all users
        setCustomers(customersResponse.data);
        setProducts(productsResponse.data.filter(product => product.isActive));
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
      [name]: value,
    });
  };

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    if (productId && !selectedProducts.some(p => p.productId === productId)) {
      const product = products.find(p => p.id === productId);
      setSelectedProducts([
        ...selectedProducts,
        {
          productId,
          quantity: 1,
          productName: product.name,
          price: product.price,
          availableStock: product.stockQuantity
        }
      ]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = Math.max(1, Math.min(
      parseInt(quantity) || 1,
      selectedProducts.find(p => p.productId === productId)?.availableStock || 1
    ));
    
    setSelectedProducts(selectedProducts.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    ).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId || selectedProducts.length === 0) {
      setError('Please select a customer and at least one product');
      return;
    }
  
    try {
      const orderData = {
        CustomerId: parseInt(formData.customerId), // Note the PascalCase
        Notes: formData.notes,
        OrderItems: selectedProducts.map(item => ({
          ProductId: item.productId,
          Quantity: item.quantity
        }))
      };
  
      console.log('Order Data:', orderData); // Log the payload for debugging
  
      await api.post('/orders', orderData);
      navigate('/orders');
    } catch (err) {
      console.error('Order Creation Error:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading data...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
      {customer.customerName} ({customer.email})
    </option>
  ))}
</select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
              Notes
            </label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Add Products
          </label>
          <div className="flex gap-2">
            <select
              onChange={handleProductSelect}
              className="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product</option>
              {products
                .filter(product => !selectedProducts.some(p => p.productId === product.id))
                .map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price}, Stock: {product.stockQuantity})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Order Items</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProducts.map(item => (
                    <tr key={item.productId}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeProduct(item.productId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium">Total:</td>
                    <td className="px-4 py-3 font-medium">${calculateTotal()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={selectedProducts.length === 0}
          >
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;