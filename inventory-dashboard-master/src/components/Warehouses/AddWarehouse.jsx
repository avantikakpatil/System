// src/components/Warehouses/AddWarehouse.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWarehouse } from '../../services/api';

const AddWarehouse = () => {
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!warehouse.name.trim()) {
      errors.name = 'Warehouse name is required';
      isValid = false;
    }

    if (!warehouse.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    if (!warehouse.latitude || isNaN(parseFloat(warehouse.latitude))) {
      errors.latitude = 'Valid latitude is required (e.g. 40.7128)';
      isValid = false;
    }

    if (!warehouse.longitude || isNaN(parseFloat(warehouse.longitude))) {
      errors.longitude = 'Valid longitude is required (e.g. -74.0060)';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWarehouse({
      ...warehouse,
      [name]: type === 'checkbox' ? checked : 
              (name === 'latitude' || name === 'longitude') ? 
              value : // Keep as string during input to allow for partial typing
              value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Convert coordinates to float for API submission
      const warehouseData = {
        ...warehouse,
        latitude: parseFloat(warehouse.latitude),
        longitude: parseFloat(warehouse.longitude)
      };

      await createWarehouse(warehouseData);
      navigate('/warehouses');
    } catch (err) {
      console.error("Error creating warehouse:", err);
      setError(err.message || 'Failed to create warehouse. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Warehouse</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Warehouse Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={warehouse.name}
            onChange={handleChange}
            className={`shadow appearance-none border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs italic mt-1">{validationErrors.name}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={warehouse.address}
            onChange={handleChange}
            className={`shadow appearance-none border ${validationErrors.address ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            rows="3"
          />
          {validationErrors.address && (
            <p className="text-red-500 text-xs italic mt-1">{validationErrors.address}</p>
          )}
        </div>
        
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-1/2 px-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
              Latitude
            </label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={warehouse.latitude}
              onChange={handleChange}
              placeholder="e.g. 40.7128"
              className={`shadow appearance-none border ${validationErrors.latitude ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            {validationErrors.latitude && (
              <p className="text-red-500 text-xs italic mt-1">{validationErrors.latitude}</p>
            )}
          </div>
          
          <div className="w-1/2 px-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
              Longitude
            </label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={warehouse.longitude}
              onChange={handleChange}
              placeholder="e.g. -74.0060"
              className={`shadow appearance-none border ${validationErrors.longitude ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            {validationErrors.longitude && (
              <p className="text-red-500 text-xs italic mt-1">{validationErrors.longitude}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={warehouse.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm font-bold">Active</span>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : 'Save Warehouse'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/warehouses')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWarehouse;