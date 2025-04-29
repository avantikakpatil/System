import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/api";

const Products = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    // New state for mobile table view
    const [expandedRow, setExpandedRow] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        category: "",
        imageUrl: "",
        isActive: true,
        minimumOrderQuantity: 0,
        productCode: "",
        supplierName: "",
        volume: "0.000000000000000000000000000000",
        weight: "0.000000000000000000000000000000"
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch products");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
  
        // Validate required fields
        if (!formData.name || !formData.description || !formData.price || !formData.stockQuantity) {
            setError("Please fill out all required fields.");
            return;
        }
  
        // Ensure price is greater than 0.01
        if (parseFloat(formData.price) <= 0.01) {
            setError("Price must be greater than 0.01.");
            return;
        }
  
        // Ensure stock quantity is a positive number
        if (parseInt(formData.stockQuantity, 10) < 0) {
            setError("Stock quantity must be a positive number.");
            return;
        }
  
        try {
            const productData = {
                Name: formData.name,
                Description: formData.description,
                Price: parseFloat(formData.price),
                StockQuantity: parseInt(formData.stockQuantity, 10),
                Category: formData.category,
                ImageUrl: formData.imageUrl,
                IsActive: formData.isActive,
                MinimumOrderQuantity: parseInt(formData.minimumOrderQuantity, 10) || 0,
                ProductCode: formData.productCode,
                SupplierName: formData.supplierName,
                Volume: parseFloat(formData.volume) || 0,
                Weight: parseFloat(formData.weight) || 0
            };
  
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await createProduct(productData);
            }
  
            await fetchProducts();
            setShowAddForm(false);
            setEditingProduct(null);
            resetForm();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                // Handle validation errors
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError("Failed to save product. Please check your data and try again.");
            }
            console.error(err);
        }
    };
  
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            stockQuantity: "",
            category: "",
            imageUrl: "",
            isActive: true,
            minimumOrderQuantity: 0,
            productCode: "",
            supplierName: "",
            volume: "0.000000000000000000000000000000",
            weight: "0.000000000000000000000000000000"
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stockQuantity: product.stockQuantity,
            category: product.category,
            imageUrl: product.imageUrl || "",
            isActive: product.isActive,
            minimumOrderQuantity: product.minimumOrderQuantity || 0,
            productCode: product.productCode || "",
            supplierName: product.supplierName || "",
            volume: product.volume ? product.volume.toFixed(30) : "0.000000000000000000000000000000",
            weight: product.weight ? product.weight.toFixed(30) : "0.000000000000000000000000000000"
        });
        setShowAddForm(true);
        
        // Scroll to the form on mobile
        if (window.innerWidth < 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                await fetchProducts();
            } catch (err) {
                setError("Failed to delete product");
                console.error(err);
            }
        }
    };

    // Toggle expanded row for mobile view
    const toggleExpandRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    if (loading) return <div className="p-3 md:p-6">Loading products...</div>;
    if (error) return <div className="p-3 md:p-6 text-red-500">{error}</div>;

    return (
        <div className="p-3 md:p-6 w-full">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Product Management</h1>

            <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-4 md:mb-6">
                <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-0">Products List</h2>
                    <button
                        className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={() => {
                            setShowAddForm(prev => !prev);
                            if (showAddForm) {
                                setEditingProduct(null);
                                resetForm();
                            }
                        }}
                    >
                        {showAddForm ? "Cancel" : "Add New Product"}
                    </button>
                </div>

                {/* Add/Edit Product Form */}
                {showAddForm && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 border rounded bg-gray-50">
                        <h3 className="text-md md:text-lg font-medium mb-3 md:mb-4">
                            {editingProduct ? "Edit Product" : "Add New Product"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Product Name</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Description</label>
                                    <textarea
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        name="description"
                                        rows="2"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        maxLength={500}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Price</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Stock Quantity</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="number"
                                        min="0"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Category</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Image URL</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        maxLength={255}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Minimum Order Quantity</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="number"
                                        min="0"
                                        name="minimumOrderQuantity"
                                        value={formData.minimumOrderQuantity}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Product Code</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="text"
                                        name="productCode"
                                        value={formData.productCode}
                                        onChange={handleChange}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Supplier Name</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="text"
                                        name="supplierName"
                                        value={formData.supplierName}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Volume</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="number"
                                        step="0.000000000000000000000000000001"
                                        name="volume"
                                        value={formData.volume}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1 md:mb-2 text-sm md:text-base">Weight</label>
                                    <input
                                        className="border rounded w-full py-1 md:py-2 px-2 md:px-3 text-sm md:text-base"
                                        type="number"
                                        step="0.000000000000000000000000000001"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <label className="text-gray-700 font-bold text-sm md:text-base">Active</label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button 
                                    className="bg-green-500 hover:bg-green-600 text-white py-1 md:py-2 px-3 md:px-4 rounded mr-2 text-sm md:text-base" 
                                    type="submit"
                                >
                                    {editingProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-1 md:py-2 px-3 md:px-4 rounded text-sm md:text-base"
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Desktop Table View - Hidden on mobile */}
                {products.length > 0 ? (
                    <>
                        {/* Desktop Table - Hidden on small screens */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full bg-white border rounded">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                                        <th className="py-2 px-4">ID</th>
                                        <th className="py-2 px-4">Product Code</th>
                                        <th className="py-2 px-4">Name</th>
                                        <th className="py-2 px-4">Category</th>
                                        <th className="py-2 px-4">Price</th>
                                        <th className="py-2 px-4">Stock</th>
                                        <th className="py-2 px-4">Status</th>
                                        <th className="py-2 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-4">{product.id}</td>
                                            <td className="py-2 px-4">{product.productCode}</td>
                                            <td className="py-2 px-4">{product.name}</td>
                                            <td className="py-2 px-4">{product.category}</td>
                                            <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                                            <td className="py-2 px-4">{product.stockQuantity}</td>
                                            <td className="py-2 px-4">
                                                <span
                                                    className={`py-1 px-2 rounded text-xs ${
                                                        product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {product.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 flex justify-center space-x-2">
                                                <button
                                                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View - Card layout for small screens */}
                        <div className="md:hidden">
                            {products.map((product) => (
                                <div key={product.id} className="mb-3 border rounded shadow-sm bg-white">
                                    <div 
                                        className="flex justify-between items-center p-3 cursor-pointer"
                                        onClick={() => toggleExpandRow(product.id)}
                                    >
                                        <div>
                                            <p className="font-bold">{product.name}</p>
                                            <p className="text-sm text-gray-600">ID: {product.id} | ${product.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span
                                                className={`mr-2 py-1 px-2 rounded text-xs ${
                                                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <svg 
                                                className={`w-4 h-4 transition-transform ${expandedRow === product.id ? 'transform rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {expandedRow === product.id && (
                                        <div className="px-3 pb-3 border-t pt-2">
                                            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                                                <div>
                                                    <p className="font-semibold">Product Code:</p>
                                                    <p>{product.productCode || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Category:</p>
                                                    <p>{product.category || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Stock:</p>
                                                    <p>{product.stockQuantity}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Supplier:</p>
                                                    <p>{product.supplierName || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(product);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(product.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 text-gray-500">No products available</div>
                )}
            </div>
        </div>
    );
};

export default Products;