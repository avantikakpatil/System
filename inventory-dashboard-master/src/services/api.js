import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5087/api";

// Axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Products API
export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
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
    const response = await api.post('/products', {
      Name: productData.Name,
      Description: productData.Description,
      Price: productData.Price,
      StockQuantity: productData.StockQuantity,
      Category: productData.Category,
      ImageUrl: productData.ImageUrl,
      IsActive: productData.IsActive,
      MinimumOrderQuantity: productData.MinimumOrderQuantity || 0,
      ProductCode: productData.ProductCode,
      SupplierName: productData.SupplierName,
      Volume: productData.Volume || 0,
      Weight: productData.Weight || 0
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const payload = {
      Name: productData.Name,
      Description: productData.Description || "",
      Price: parseFloat(productData.Price),
      StockQuantity: parseInt(productData.StockQuantity, 10),
      Category: productData.Category || "Uncategorized",
      ImageUrl: productData.ImageUrl || "",
      IsActive: productData.IsActive ?? true,
    };

    console.log("Updating product:", JSON.stringify(payload, null, 2));

    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    console.log(`Deleting product with ID: ${id}`);
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Users API
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    if (!userData.Email) {
      throw new Error("Email is required");
    }

    const normalizedEmail = userData.Email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Invalid email address");
    }

    userData.Email = normalizedEmail;

    console.log("Creating user:", userData);

    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log(`Updating user ${userId}:`, userData);

    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    console.log(`Deleting user with ID: ${userId}`);
    await api.delete(`/users/${userId}`);
    return { message: "User deleted successfully" };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Orders API
export const getOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await api.delete(`/orders/${orderId}`);
    return { message: "Order deleted successfully" };
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getWarehouses = async () => {
  try {
    // Change from '/warehouses/all' to '/warehouses'
    const response = await api.get('/warehouses');
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
};

export const getWarehouse = async (id) => {
  try {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching warehouse ${id}:`, error);
    throw error;
  }
};

export const createWarehouse = async (warehouseData) => {
  try {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  } catch (error) {
    console.error('Error creating warehouse:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateWarehouse = async (id, warehouseData) => {
  try {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating warehouse ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteWarehouse = async (id) => {
  try {
    await api.delete(`/warehouses/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting warehouse ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getTrucks = async () => {
  try {
    const response = await api.get('/trucks');
    return response.data;
  } catch (error) {
    console.error("Error fetching trucks:", error);
    throw error;
  }
};

export const getAvailableTrucks = async () => {
  try {
    const response = await api.get('/trucks/available');
    return response.data;
  } catch (error) {
    console.error("Error fetching available trucks:", error);
    throw error;
  }
};

export const getTruckById = async (id) => {
  try {
    const response = await api.get(`/trucks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching truck ${id}:`, error);
    throw error;
  }
};

export const createTruck = async (truckData) => {
  try {
    const response = await api.post('/trucks', truckData);
    return response.data;
  } catch (error) {
    console.error('Error creating truck:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const assignTruck = async (assignData) => {
  try {
    const response = await api.post('/trucks/assign', assignData);
    return response.data;
  } catch (error) {
    console.error('Error assigning truck:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const removeAssignment = async (orderId) => {
  try {
    // Using the same endpoint as assignment but with a null truckId to indicate unassignment
    const response = await api.post('/trucks/assign', {
      orderIds: [orderId],
      truckId: null,
      driverName: null
    });
    return response.data;
  } catch (error) {
    console.error(`Error removing assignment for order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteTruck = async (id) => {
  try {
    const response = await api.delete(`/trucks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting truck ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAssignedOrders = async () => {
  try {
    const response = await api.get('/trucks/assigned-orders');
    return response.data;
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    throw error;
  }
};

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Authentication placeholders (can be removed if not needed)
export const loginUser = async () => {
  console.warn("Authentication is not implemented");
  return { success: false };
};

export const logoutUser = () => {
  console.warn("Authentication is not implemented");
};

export default api;