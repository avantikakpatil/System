import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5087/api';

// Single interceptor for all requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    // Convert payload to PascalCase to match server's CreateProductDto
    const payload = {
      Name: productData.Name,
      Description: productData.Description,
      Price: parseFloat(productData.Price),
      StockQuantity: parseInt(productData.StockQuantity, 10),
      Category: productData.Category || "Uncategorized", // Default value if empty
      ImageUrl: productData.ImageUrl,
      IsActive: productData.IsActive,
    };

    console.log('Creating product with data:', JSON.stringify(payload, null, 2));

    const response = await api.post('/products', payload);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating product:');
    console.error('Request data:', productData);
    console.error('Error details:', error.response?.data || error.message);

    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    // Convert payload to PascalCase to match server's CreateProductDto
    const payload = {
      Name: productData.Name,
      Description: productData.Description,
      Price: parseFloat(productData.Price),
      StockQuantity: parseInt(productData.StockQuantity, 10),
      Category: productData.Category || "Uncategorized", // Default value if empty
      ImageUrl: productData.ImageUrl,
      IsActive: productData.IsActive,
    };

    console.log('Updating product with data:', JSON.stringify(payload, null, 2));

    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Users API endpoints
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    console.log("Creating user with data:", userData);
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    console.log("Updating user:", userId, "with data:", userData);
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error);
    throw error;
  }
};

// Delete a user (optional)
export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_URL}/${userId}`);
    console.log("User deleted:", userId);
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error);
    throw error;
  }
};

// Authentication logic removed as per your instruction
// Only keeping these functions with minimal implementation in case they're referenced elsewhere
export const loginUser = async () => {
  console.warn('Authentication is not implemented');
  return { success: false };
};

export const logoutUser = () => {
  console.warn('Authentication is not implemented');
};

export default api;