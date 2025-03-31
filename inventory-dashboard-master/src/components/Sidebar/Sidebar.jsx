import React from 'react';
import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import { FaTruck } from "react-icons/fa";  

import {
  FaHome, FaShoppingCart, FaBoxOpen, FaBox, FaUser,
  FaFileInvoice, FaChartBar, FaFacebook, FaAmazon, FaPinterest,  FaRoute, FaMap 
} from 'react-icons/fa';  

const Sidebar = () => {   
  return (     
    <div className="w-52 bg-gray-900 text-white h-screen flex flex-col">       
      <div className="p-4 flex items-center">         
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>         
        <span className="ml-2 font-bold text-lg">System</span>       
      </div>              
      <nav className="mt-6 flex-1">         
        <Link to="/dashboard">
          <SidebarItem icon={<FaHome />} text="Home" />
        </Link>         
        <Link to="/users">
          <SidebarItem icon={<FaUser />} text="Users" />
        </Link>
        <Link to="/orders">
          <SidebarItem icon={<FaShoppingCart />} text="Sales order" />
        </Link>
        <Link to="/products">
          <SidebarItem icon={<FaBox />} text="Products" />
        </Link>         
        <SidebarItem icon={<FaFileInvoice />} text="Invoice" active={false} /> 

        <Link to="/warehouses">
  <SidebarItem icon={<FaTruck />} text="Warehouses" />
</Link>
<Link to="/delivery-routes">
<SidebarItem icon={<FaMap className="h-5 w-5" />}  text="Delivery Routes" />
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
    </div>   
  ); 
};  

export default Sidebar;