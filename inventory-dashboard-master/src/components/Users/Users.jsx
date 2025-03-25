import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/api";

const parseUserData = (rawData) => {
  // Check if rawData is already an array of user objects
  if (Array.isArray(rawData)) {
    // If the data is already in the correct format, normalize the keys
    return rawData.map(user => ({
      id: user.id || user.Id,
      CustomerName: user.customerName || user.CustomerName,
      Email: user.email || user.Email,
      Role: user.role || user.Role || 'User',
      PhoneNumber: user.phoneNumber || user.PhoneNumber || '',
      BillingAddress: user.billingAddress || user.BillingAddress || '',
      CompanyName: user.companyName || user.CompanyName || '',
      ShippingAddress: user.shippingAddress || user.ShippingAddress || '',
      GSTNumber: user.gstNumber || user.GSTNumber || '',
      Latitude: user.latitude || user.Latitude || 0,
      Longitude: user.longitude || user.Longitude || 0,
      Notes: user.notes || user.Notes || '',
      CreatedAt: user.createdAt || user.CreatedAt || new Date().toISOString()
    }));
  }

  // If rawData is a string or something else, fall back to previous parsing logic
  if (!rawData || typeof rawData !== 'string') {
    console.warn('Invalid user data received:', rawData);
    return [];
  }

  // Original parsing logic as a fallback
  const rows = rawData.toString().trim().split('\n');
  
  return rows.map((row, index) => {
    if (!row.trim()) return null;

    const emailMatch = row.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
    
    if (!emailMatch) return null;

    const email = emailMatch[1];
    const parts = row.split(email);
    
    return {
      id: index + 1,
      CustomerName: parts[0] ? parts[0].trim() : 'Unknown',
      Email: email,
      CreatedAt: parts[1] ? parts[1].trim().split(' ')[0] : new Date().toISOString().split('T')[0],
      Role: 'User',
      Latitude: 0,
      Longitude: 0,
      PhoneNumber: '',
      CompanyName: '',
      ShippingAddress: '',
      BillingAddress: '',
      GSTNumber: '',
      Notes: ''
    };
  }).filter(user => user !== null);
};

const Users = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "User",
    phoneNumber: "",
    companyName: "",
    shippingAddress: "",
    billingAddress: "",
    gstNumber: "",
    latitude: "",
    longitude: "",
    notes: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Assume getUsers might return various types of data
      const rawData = await getUsers(); 
      
      // Parse the raw data into user objects
      const parsedUsers = parseUserData(rawData);
      
      setUsers(parsedUsers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Trim and validate email
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
  
    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Invalid email format");
      return;
    }
  
    // Check for existing email (case-insensitive)
    const isDuplicateEmail = users.some(
      user => user.Email && 
              user.Email.toLowerCase() === trimmedEmail.toLowerCase() && 
              (!editingUser || user.id !== editingUser.id)
    );
  
    if (isDuplicateEmail) {
      setError("Email is already registered");
      return;
    }
  
    try {
      const userData = {
        CustomerName: formData.name.trim(),
        Email: trimmedEmail,
        CreatedAt: new Date().toISOString(),
        Role: formData.role || 'User',
        PhoneNumber: formData.phoneNumber.trim(),
        CompanyName: formData.companyName.trim(),
        ShippingAddress: formData.shippingAddress.trim(),
        BillingAddress: formData.billingAddress.trim(),
        GSTNumber: formData.gstNumber.trim(),
        Latitude: parseFloat(formData.latitude) || 0,
        Longitude: parseFloat(formData.longitude) || 0,
        Notes: formData.notes.trim(),
      };
  
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
  
      await fetchUsers();
      setShowAddForm(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        role: "User",
        phoneNumber: "",
        companyName: "",
        shippingAddress: "",
        billingAddress: "",
        gstNumber: "",
        latitude: "",
        longitude: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.message || "Failed to save user");
    }
  };

  const handleEdit = (user) => {
    // Ensure user is defined and has properties
    if (!user) {
      console.error('Attempting to edit undefined user');
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.CustomerName || '',
      email: user.Email || '',
      role: user.Role || 'User',
      phoneNumber: user.PhoneNumber || '',
      companyName: user.CompanyName || '',
      shippingAddress: user.ShippingAddress || '',
      billingAddress: user.BillingAddress || '',
      gstNumber: user.GSTNumber || '',
      latitude: user.Latitude ? user.Latitude.toString() : '',
      longitude: user.Longitude ? user.Longitude.toString() : '',
      notes: user.Notes || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        setError("Failed to delete user");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Users List</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingUser(null);
              setFormData({
                name: "",
                email: "",
                password: "",
                role: "User",
                phoneNumber: "",
                companyName: "",
                shippingAddress: "",
                billingAddress: "",
                gstNumber: "",
                latitude: "",
                longitude: "",
                notes: "",
              });
            }}
          >
            {showAddForm ? "Cancel" : "Add New User"}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", name: "name" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Password", name: "password", type: "password" },
                  { label: "Phone Number", name: "phoneNumber" },
                  { label: "Company Name", name: "companyName" },
                  { label: "Shipping Address", name: "shippingAddress" },
                  { label: "Billing Address", name: "billingAddress" },
                  { label: "GST Number", name: "gstNumber" },
                  { label: "Latitude", name: "latitude" },
                  { label: "Longitude", name: "longitude" },
                  { label: "Notes", name: "notes" },
                ].map(({ label, name, type = "text" }) => (
                  <div key={name}>
                    <label className="block text-gray-700 font-bold mb-2">{label}</label>
                    <input
                      className="border rounded w-full py-2 px-3"
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required={name !== "notes"}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Role</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button className="bg-green-500 text-white py-2 px-4 rounded mr-2" type="submit">
                  {editingUser ? "Update User" : "Add User"}
                </button>
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

<table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-6">{user.id}</td>
                <td className="py-3 px-6">{user.CustomerName}</td>
                <td className="py-3 px-6">{user.Email}</td>
                <td className="py-3 px-6">{user.Role || 'User'}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No users found. Add a new user to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;