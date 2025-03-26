import React, { useState } from "react";
import { createProduct } from "../../services/api";

const AddProduct = ({ onProductAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    productCode: "",
    description: "",
    category: "",
    price: 0,
    weight: 0,
    volume: 0,
    stockQuantity: 0,
    minimumOrderQuantity: 1,
    supplierName: "",
    imageUrl: "",
    isActive: true
  });
  
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);

  const categories = [
    "Electronics", 
    "Clothing", 
    "Books", 
    "Home & Kitchen", 
    "Toys", 
    "Sports", 
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload to a cloud storage service
      // For now, we'll just set the image and create a local URL
      setImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        Name: formData.name,
        ProductCode: formData.productCode,
        Description: formData.description,
        Category: formData.category,
        Price: parseFloat(formData.price),
        Weight: parseFloat(formData.weight),
        Volume: parseFloat(formData.volume),
        StockQuantity: parseInt(formData.stockQuantity),
        MinimumOrderQuantity: parseInt(formData.minimumOrderQuantity),
        SupplierName: formData.supplierName,
        ImageUrl: formData.imageUrl || null,
        IsActive: formData.isActive
      };

      console.log("Sending product data:", productData);
      const response = await createProduct(productData);
      console.log("Product created successfully:", response);
      
      onProductAdded();
      setFormData({
        name: "",
        productCode: "",
        description: "",
        category: "",
        price: 0,
        weight: 0,
        volume: 0,
        stockQuantity: 0,
        minimumOrderQuantity: 1,
        supplierName: "",
        imageUrl: "",
        isActive: true
      });
      setError('');
    } catch (err) {
      console.error("Failed to add product:", err);
      
      // Enhanced error handling
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.errors) {
          const errorMessages = [];
          const errorData = err.response.data.errors;
          
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
            <label className="block text-gray-700 font-bold mb-2">Product Code</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="productCode"
              value={formData.productCode}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Category</label>
            <select
              className="border rounded w-full py-2 px-3"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Price (per unit)</label>
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
            <label className="block text-gray-700 font-bold mb-2">Weight (kg)</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              step="0.01"
              min="0"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Volume (m³)</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              step="0.0001"
              min="0"
              name="volume"
              value={formData.volume}
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

          <div>
            <label className="block text-gray-700 font-bold mb-2">Minimum Order Quantity</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              min="1"
              name="minimumOrderQuantity"
              value={formData.minimumOrderQuantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Supplier Name</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Product Image</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {formData.imageUrl && (
              <img 
                src={formData.imageUrl} 
                alt="Product Preview" 
                className="mt-2 h-24 w-24 object-cover"
              />
            )}
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
          <button 
            className="bg-green-500 text-white py-2 px-4 rounded mr-2" 
            type="submit"
          >
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