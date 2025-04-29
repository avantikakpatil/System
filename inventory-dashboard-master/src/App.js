// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider, useSidebar } from "./components/Sidebar/SidebarContext";
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
import AssignTruck from './components/Map/AssignTruck';
import CreateTruckPage from './components/Map/CreateTruck';

// AppContent component to access the sidebar context
const AppContent = () => {
  const { isOpen, isMobile } = useSidebar();
  
  return (
    <div className="flex">
      <Sidebar />
      <main 
        className={`min-h-screen transition-all duration-300 bg-gray-100 ${
          isOpen && !isMobile ? 'ml-52' : 'ml-0'
        } flex-1 pt-0 px-10`}
      >
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
          <Route path="/assign-truck" element={<AssignTruck />} />
          <Route path="/trucks/create" element={<CreateTruckPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;