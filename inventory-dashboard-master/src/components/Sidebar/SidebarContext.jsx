// src/components/Sidebar/SidebarContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const SidebarContext = createContext();

// Custom hook to use the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Provider component
export const SidebarProvider = ({ children }) => {
  // Default to closed on mobile, open on desktop
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-adjust sidebar based on screen size
      // Only auto-close on mobile if it's the first load (on resize we respect user preference)
      if (mobile && window.innerWidth !== window.prevWidth) {
        setIsOpen(false);
      } else if (!mobile && window.innerWidth !== window.prevWidth) {
        setIsOpen(true);
      }
      
      // Store previous width to detect real resize vs. initial load
      window.prevWidth = window.innerWidth;
    };
    
    // Set initial value
    window.prevWidth = window.innerWidth;
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  // Value to be provided to consumers
  const value = {
    isOpen,
    toggleSidebar,
    isMobile
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;