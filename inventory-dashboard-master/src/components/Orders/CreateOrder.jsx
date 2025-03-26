import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getProducts, createOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';  // Assume an auth context exists

const CreateOrder = () => {
    const { user } = useAuth();  // Get current user from auth context
    const navigate = useNavigate();

    // Check if user is an admin, redirect if not
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/unauthorized');  // Redirect to unauthorized page
            return;
        }
    }, [user, navigate]);

    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch users and products (only for admins)
    useEffect(() => {
        if (user?.role !== 'ADMIN') return;

        const fetchData = async () => {
            try {
                const [usersData, productsData] = await Promise.all([
                    getUsers(),
                    getProducts()
                ]);

                // Filter out inactive or blocked users
                const activeUsers = usersData.filter(u => u.status === 'ACTIVE');
                
                setUsers(activeUsers);
                setProducts(
                    productsData
                        .filter(p => p.stockQuantity > 0 && p.status === 'AVAILABLE')
                );
                setLoading(false);
            } catch (err) {
                console.error('Data fetch error:', err);
                setError('Unable to load order creation data');
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleAddItem = () => {
        if (orderItems.length < 10) {
            setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
        } else {
            setError('Maximum of 10 products per order');
        }
    };

    const handleRemoveItem = (index) => {
        if (orderItems.length > 1) {
            const newItems = orderItems.filter((_, i) => i !== index);
            setOrderItems(newItems);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index] = {
            ...newItems[index],
            [field]: field === 'quantity' 
                ? Math.max(1, Math.min(parseInt(value) || 1, 100))
                : value
        };
        setOrderItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Double-check admin authorization
        if (!user || user.role !== 'ADMIN') {
            setError('Unauthorized: Only admins can create orders');
            return;
        }

        setSubmitting(true);
        setError(null);
        
        if (!selectedUserId) {
            setError('Please select a customer');
            setSubmitting(false);
            return;
        }

        const invalidItems = orderItems.filter(
            item => !item.productId || item.quantity <= 0 || item.quantity > 100
        );

        if (invalidItems.length > 0) {
            setError('Please ensure all products have valid quantities (1-100)');
            setSubmitting(false);
            return;
        }

        try {
            const orderData = {
                userId: parseInt(selectedUserId, 10),
                adminId: user.id,  // Include admin ID who created the order
                orderItems: orderItems.map(item => ({
                    productId: parseInt(item.productId, 10),
                    quantity: parseInt(item.quantity, 10)
                })),
                source: 'ADMIN_CREATED'  // Mark order as admin-created
            };

            const response = await createOrder(orderData);

            if (response && response.id) {
                // Optionally add a success toast/notification
                navigate('/orders');
            } else {
                throw new Error('Order creation failed');
            }
        } catch (err) {
            console.error('Order submission error:', err);
            setError(
                err.response?.data?.message || 
                err.message || 
                'Failed to create order. Please try again.'
            );
            setSubmitting(false);
        }
    };

    // If not an admin, show nothing
    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2">🛒</span> Create Order (Admin)
            </h1>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="userId">
                        Customer *
                    </label>
                    <select
                        id="userId"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                    >
                        <option value="">Select a customer</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.customerName} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Order Items *
                    </label>
                    
                    {orderItems.map((item, index) => {
                        const selectedProduct = products.find(p => p.id == item.productId);
                        const availableStock = selectedProduct?.stockQuantity || 0;
                        
                        return (
                            <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-end">
                                <div className="col-span-6">
                                    <label className="block text-gray-600 text-sm mb-1">
                                        Product
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={item.productId}
                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option 
                                                key={product.id} 
                                                value={product.id}
                                                disabled={product.stockQuantity <= 0}
                                            >
                                                {product.name} (${product.price.toFixed(2)}) - {product.stockQuantity} in stock
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-gray-600 text-sm mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={availableStock}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        required
                                    />
                                    {selectedProduct && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max: {availableStock}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <button
                                        type="button"
                                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={orderItems.length <= 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        onClick={handleAddItem}
                    >
                        Add Product
                    </button>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-lg"
                        onClick={() => navigate('/orders')}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrder;