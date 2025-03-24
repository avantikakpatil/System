import React, { useState } from "react";
import { createProduct } from "../../services/api";

const AddProduct = ({ onProductAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    category: "",
    imageUrl: "",
    isActive: true
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert price and stockQuantity to numbers and use PascalCase for .NET
      const productData = {
        Name: formData.name,
        Description: formData.description,
        Price: parseFloat(formData.price),
        StockQuantity: parseInt(formData.stockQuantity),
        Category: formData.category,
        ImageUrl: formData.imageUrl || null,
        IsActive: formData.isActive
      };

      console.log("Sending product data:", productData);
      const response = await createProduct(productData);
      console.log("Product created successfully:", response);
      
      onProductAdded();
      setFormData({
        name: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        category: "",
        imageUrl: "",
        isActive: true
      });
      setError('');
    } catch (err) {
      console.error("Failed to add product:", err);
      
      // Detailed error logging
      console.error("Error response:", err.response?.data);
      
      // Enhanced error handling
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errorMessages = [];
          const errorData = err.response.data.errors;
          
          // Extract all error messages
          Object.keys(errorData).forEach(key => {
            const messages = errorData[key];
            if (Array.isArray(messages)) {
              messages.forEach(msg => errorMessages.push(msg));
            } else {
              errorMessages.push(messages);
            }
          });
          
          setError(errorMessages.join(', '));
        } else if (err.response.data.title) {
          setError(err.response.data.title);
        } else {
          setError('Failed to add product. Please check your data and try again.');
        }
      } else {
        setError('Failed to add product. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Product Name</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Category</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Price</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Stock Quantity</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              min="0"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              className="border rounded w-full py-2 px-3"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Image URL</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="http://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700 font-bold">Active</label>
          </div>
        </div>

        <div className="mt-4">
          <button className="bg-green-500 text-white py-2 px-4 rounded mr-2" type="submit">
            Add Product
          </button>
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;