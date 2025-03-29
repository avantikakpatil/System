// src/services/mockData.js
export const mockWarehouses = [
    {
      id: 1,
      name: "Mumbai Central Warehouse",
      address: "Andheri East, Mumbai, Maharashtra",
      latitude: "19.1136",
      longitude: "72.8697"
    },
    {
      id: 2,
      name: "Delhi Distribution Center",
      address: "Gurugram Industrial Area, Delhi NCR",
      latitude: "28.4595",
      longitude: "77.0266"
    },
    {
      id: 3,
      name: "Bangalore Logistics Hub",
      address: "Electronic City, Bangalore, Karnataka",
      latitude: "12.9716",
      longitude: "77.5946"
    },
    {
      id: 4,
      name: "Chennai Warehouse",
      address: "Chennai Port, Tamil Nadu",
      latitude: "13.0827",
      longitude: "80.2707"
    }
  ];
  
  export const mockCustomers = [
    {
      id: 1,
      customerName: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      shippingAddress: "123 MG Road, Pune, Maharashtra",
      phone: "+91 98765 43210",
      latitude: "18.5204",
      longitude: "73.8567"
    },
    {
      id: 2,
      customerName: "Priya Singh",
      email: "priya.singh@example.com",
      shippingAddress: "456 Anna Salai, Chennai, Tamil Nadu",
      phone: "+91 87654 32109",
      latitude: "13.0569",
      longitude: "80.2425"
    },
    {
      id: 3,
      customerName: "Amit Patel",
      email: "amit.patel@example.com",
      shippingAddress: "789 Brigade Road, Bangalore, Karnataka",
      phone: "+91 76543 21098",
      latitude: "12.9719",
      longitude: "77.6412"
    },
    {
      id: 4,
      customerName: "Sneha Verma",
      email: "sneha.verma@example.com",
      shippingAddress: "101 Connaught Place, New Delhi",
      phone: "+91 65432 10987",
      latitude: "28.6304",
      longitude: "77.2177"
    }
  ];
  
  export const mockOrders = [
    {
      id: 1,
      customerId: 1,
      warehouseId: 1,
      status: "In Transit",
      createdAt: "2025-03-25T10:30:00Z"
    },
    {
      id: 2,
      customerId: 2,
      warehouseId: 4,
      status: "Delivered",
      createdAt: "2025-03-23T14:15:00Z"
    },
    {
      id: 3,
      customerId: 3,
      warehouseId: 3,
      status: "Processing",
      createdAt: "2025-03-28T09:45:00Z"
    },
    {
      id: 4,
      customerId: 4,
      warehouseId: 2,
      status: "In Transit",
      createdAt: "2025-03-26T16:20:00Z"
    }
  ];
  
  export const mockRoutes = [
    {
      orderId: 1,
      warehouse: mockWarehouses[0],
      customer: mockCustomers[0]
    },
    {
      orderId: 2,
      warehouse: mockWarehouses[3],
      customer: mockCustomers[1]
    },
    {
      orderId: 3,
      warehouse: mockWarehouses[2],
      customer: mockCustomers[2]
    },
    {
      orderId: 4,
      warehouse: mockWarehouses[1],
      customer: mockCustomers[3]
    }
  ];