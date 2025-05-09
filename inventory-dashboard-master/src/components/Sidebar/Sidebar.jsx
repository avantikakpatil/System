// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import { FaTruck, FaBars, FaTimes } from "react-icons/fa";  
import { useSidebar } from './SidebarContext';  // Fixed import path

import {
  FaHome, FaShoppingCart, FaBoxOpen, FaBox, FaUser,
  FaFileInvoice, FaChartBar, FaFacebook, FaAmazon, FaPinterest, FaRoute, FaMap, FaListOl
} from 'react-icons/fa';  

const Sidebar = () => {   
  const { isOpen, toggleSidebar, isMobile } = useSidebar();

  return (
    <>
      {/* Toggle button - positioned outside the sidebar */}
      {isMobile && (
  <button 
    className={`fixed z-40 p-2 rounded-md bg-gray-800 text-white transition-all duration-300
               ${isOpen ? 'left-52 top-4' : 'left-4 top-4'}`}
    onClick={toggleSidebar}
    aria-label="Toggle sidebar"
  >
    {isOpen ? <FaTimes /> : <FaBars />}
  </button>
)}

      
      {/* Overlay to close sidebar when clicking outside on mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
  className={`bg-gray-900 text-white h-screen fixed top-0 left-0 flex flex-col transition-all duration-300 ease-in-out z-30
             ${isMobile ? (isOpen ? 'w-52 translate-x-0' : 'w-52 -translate-x-52') : 'w-52 translate-x-0'}`}
>

        <div className="p-4 flex items-center">         
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>         
          <span className="ml-2 font-bold text-lg">System</span>       
        </div>              
        <nav className="mt-6 flex-1 overflow-y-auto">         
          <Link to="/dashboard" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaHome />} text="Home" />
          </Link>         
          <Link to="/users" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaUser />} text="Users" />
          </Link>
          <Link to="/orders" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaShoppingCart />} text="Sales order" />
          </Link>
          <Link to="/products" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaBox />} text="Products" />
          </Link>         
          <Link to="/assign-truck" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaTruck />} text="Assign Truck" />
          </Link>
          
          <Link to="/warehouses" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaTruck />} text="Warehouses" />
          </Link>
          <Link to="/delivery-routes" onClick={() => isMobile && toggleSidebar()}>
            <SidebarItem icon={<FaMap />} text="Delivery Routes" />
          </Link>

          <SidebarItem icon={<FaChartBar />} text="Reports" active={false} />                  
          <div className="px-4 py-2 mt-6">           
            <p className="text-xs text-gray-400 uppercase tracking-wider">SALES CHANNEL</p>         
          </div>         
          <SidebarItem icon={<FaFacebook />} text="Facebook" active={false} />         
          <SidebarItem icon={<FaAmazon />} text="Amazon" active={false} />         
          <SidebarItem icon={<FaPinterest />} text="Pinterest" active={false} />       
        </nav>              
        <div className="mx-4 my-4">         
          <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded text-sm">           
            Add Channel         
          </button>       
        </div>     
      </aside>
    </>
  ); 
};  

export default Sidebar;