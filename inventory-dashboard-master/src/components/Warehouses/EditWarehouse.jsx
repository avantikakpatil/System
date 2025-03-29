// src/components/Warehouses/EditWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWarehouse, updateWarehouse } from '../../services/api';

const EditWarehouse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const data = await getWarehouse(id);
        setWarehouse(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch warehouse details');
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWarehouse({
      ...warehouse,
      [name]: type === 'checkbox' ? checked : name === 'latitude' || name === 'longitude' ? parseFloat(value) || value : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate coordinates
      if (isNaN(warehouse.latitude) || isNaN(warehouse.longitude)) {
        throw new Error('Latitude and longitude must be valid numbers');
      }

      await updateWarehouse(id, warehouse);
      navigate('/warehouses');
    } catch (err) {
      setError(err.message || 'Failed to update warehouse');
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Warehouse</h1>
      
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
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
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
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
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
              required
              placeholder="e.g. 40.7128"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
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
              required
              placeholder="e.g. -74.0060"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
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
            disabled={saving}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : 'Update Warehouse'}
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

export default EditWarehouse;