import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Users from "./components/Users/Users";
import Products from "./components/Products/Products";
import Orders from "./components/Orders/Orders";
import CreateOrder from "./components/Orders/CreateOrder";
import OrderDetail from "./components/Orders/OrderDetail";
import Warehouses from './components/Warehouses/Warehouses';
import AddWarehouse from './components/Warehouses/AddWarehouse';
import EditWarehouse from './components/Warehouses/EditWarehouse';
import 'leaflet/dist/leaflet.css';

// Import the new component
import DeliveryRoutes from './components/DeliveryRoutes';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/add" element={<AddWarehouse />} />
            <Route path="/warehouses/edit/:id" element={<EditWarehouse />} />
            {/* Add the new route */}
            <Route path="/delivery-routes" element={<DeliveryRoutes />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;