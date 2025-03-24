import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/api";

const Users = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
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

    try {
      const userData = {
        CustomerName: formData.name,
        Email: formData.email,
        ShippingAddress: formData.shippingAddress,
        CreatedAt: new Date().toISOString(),
        BillingAddress: formData.billingAddress,
        CompanyName: formData.companyName,
        GSTNumber: formData.gstNumber,
        Latitude: parseFloat(formData.latitude) || 0,
        Longitude: parseFloat(formData.longitude) || 0,
        Notes: formData.notes,
        PhoneNumber: formData.phoneNumber,
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
    } catch (err) {
      console.error("Error saving user:", err.response?.data || err.message);
      setError(err.response?.data?.title || "Failed to save user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.CustomerName,
      email: user.Email,
      phoneNumber: user.PhoneNumber,
      companyName: user.CompanyName,
      shippingAddress: user.ShippingAddress,
      billingAddress: user.BillingAddress,
      gstNumber: user.GSTNumber,
      latitude: user.Latitude.toString(),
      longitude: user.Longitude.toString(),
      notes: user.Notes,
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
          <tbody>{/* Map user data here */}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
