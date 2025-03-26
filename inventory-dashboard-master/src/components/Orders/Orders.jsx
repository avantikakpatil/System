import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaEdit, FaRedo } from 'react-icons/fa';
import { getOrders, deleteOrder, updateOrderStatus } from '../../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const ordersData = await getOrders();
            setOrders(ordersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);
    const handleDelete = async (id) => {
        try {
            await deleteOrder(id);
            setOrders(orders.filter(order => order.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const updatedOrder = await updateOrderStatus(id, status);
            setOrders(orders.map(order => 
                order.id === id ? updatedOrder : order
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Loading orders...</div>;
    if (error) return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
                <div className="text-red-500 mr-3">
                    <FaRedo className="cursor-pointer" onClick={handleRetry} />
                </div>
                <div>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <FaShoppingCart className="mr-2" /> Orders
            </h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Order"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;