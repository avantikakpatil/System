// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import DeliveryRoutes from './components/DeliveryRoutes';
import AssignTruck from './components/Map/AssignTruck';  // Import new component
import CreateTruckPage from './components/Map/CreateTruck'; // adjust path based on your project
import LoadingSequence from './components/Map/LoadingSequence'; // adjust path based on your project



function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar is now fixed, so add a left margin for content */}
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen ml-52 p-4">
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
            <Route path="/delivery-routes" element={<DeliveryRoutes />} />
            <Route path="/assign-truck" element={<AssignTruck />} />  {/* New route for AssignTruck */}
            <Route path="/trucks/create" element={<CreateTruckPage />} />
            <Route path="/loading-sequence" element={<LoadingSequence />} />



          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
