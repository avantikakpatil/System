import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getProducts, createOrder } from '../../services/api';

const CreateOrder = () => {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, productsData] = await Promise.all([
                    getUsers(),
                    getProducts()
                ]);
                setUsers(usersData);
                setProducts(productsData.filter(p => p.stockQuantity > 0));
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddItem = () => {
        setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        if (orderItems.length <= 1) return;
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
        setOrderItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        if (!selectedUserId) {
            setError('Please select a customer');
            setSubmitting(false);
            return;
        }

        if (orderItems.some(item => !item.productId || item.quantity <= 0)) {
            setError('Please fill all product fields with valid quantities');
            setSubmitting(false);
            return;
        }

        try {
            const orderData = {
                CustomerId: parseInt(selectedUserId),
                OrderItems: orderItems.map(item => ({
                    ProductId: parseInt(item.productId),
                    Quantity: item.quantity
                }))
            };

            await createOrder(orderData);
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create order');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
            
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