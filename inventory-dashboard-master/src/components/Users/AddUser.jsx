import React, { useState } from "react";
import { createUser } from "../../services/api";

const AddUser = ({ onUserAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    billingAddress: "",
    shippingAddress: "",
    latitude: 0,
    longitude: 0,
    gstNumber: "",
    companyName: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      onUserAdded();
      setFormData({
        customerName: "",
        email: "",
        phoneNumber: "",
        billingAddress: "",
        shippingAddress: "",
        latitude: 0,
        longitude: 0,
        gstNumber: "",
        companyName: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Customer Name</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Billing Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Billing Address</label>
            <textarea
              className="border rounded w-full py-2 px-3"
              name="billingAddress"
              rows="3"
              value={formData.billingAddress}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Shipping Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Shipping Address</label>
            <textarea
              className="border rounded w-full py-2 px-3"
              name="shippingAddress"
              rows="3"
              value={formData.shippingAddress}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Latitude and Longitude */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Latitude</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              step="0.000001"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Longitude</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="number"
              step="0.000001"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">GST Number</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Company Name</label>
            <input
              className="border rounded w-full py-2 px-3"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Notes</label>
            <textarea
              className="border rounded w-full py-2 px-3"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="mt-4">
          <button className="bg-green-500 text-white py-2 px-4 rounded mr-2" type="submit">
            Add User
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

export default AddUser;