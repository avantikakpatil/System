import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/api";

const Products = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

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
  
            console.log('Creating product with data:', JSON.stringify(productData, null, 2));
  
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
            name: product.Name,
            description: product.Description,
            price: product.Price,
            stockQuantity: product.StockQuantity,
            category: product.Category,
            imageUrl: product.ImageUrl || "",
            isActive: product.IsActive,
            minimumOrderQuantity: product.MinimumOrderQuantity || 0,
            productCode: product.ProductCode || "",
            supplierName: product.SupplierName || "",
            volume: product.Volume ? product.Volume.toFixed(30) : "0.000000000000000000000000000000",
            weight: product.Weight ? product.Weight.toFixed(30) : "0.000000000000000000000000000000"
        });
        setShowAddForm(true);
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

    if (loading) return <div className="p-6">Loading products...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-bold mb-6">Product Management</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Products List</h2>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={() => {
                            // Always toggle form visibility
                            setShowAddForm(prev => !prev);
                            
                            // If closing the form, reset editing state and form
                            if (showAddForm) {
                                setEditingProduct(null);
                                resetForm();
                            }
                        }}
                    >
                        {showAddForm ? "Cancel" : "Add New Product"}
                    </button>
                </div>

                {/* Add Product Form */}
                {showAddForm && (
                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <h3 className="text-lg font-medium mb-4">
                            {editingProduct ? "Edit Product" : "Add New Product"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Form fields as in previous implementation */}
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Product Name</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                    />
                                </div>




                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                                    <textarea
                                        className="border rounded w-full py-2 px-3"
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        maxLength={500}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Price</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
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
                                    <label className="block text-gray-700 font-bold mb-2">Stock Quantity</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="number"
                                        min="0"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Category</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Image URL</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        maxLength={255}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Minimum Order Quantity</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="number"
                                        min="0"
                                        name="minimumOrderQuantity"
                                        value={formData.minimumOrderQuantity}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Product Code</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="text"
                                        name="productCode"
                                        value={formData.productCode}
                                        onChange={handleChange}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Supplier Name</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="text"
                                        name="supplierName"
                                        value={formData.supplierName}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Volume</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
                                        type="number"
                                        step="0.000000000000000000000000000001"
                                        name="volume"
                                        value={formData.volume}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Weight</label>
                                    <input
                                        className="border rounded w-full py-2 px-3"
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
                                    <label className="text-gray-700 font-bold">Active</label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button 
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2" 
                                    type="submit"
                                >
                                    {editingProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
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


            {/* Products Table */}
            {products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                                    <th className="py-3 px-6">ID</th>
                                    <th className="py-3 px-6">Product Code</th>
                                    <th className="py-3 px-6">Name</th>
                                    <th className="py-3 px-6">Category</th>
                                    <th className="py-3 px-6">Price</th>
                                    <th className="py-3 px-6">Stock</th>
                                    <th className="py-3 px-6">Supplier</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-6">{product.id}</td>
                                        <td className="py-3 px-6">{product.productCode}</td>
                                        <td className="py-3 px-6">{product.name}</td>
                                        <td className="py-3 px-6">{product.category}</td>
                                        <td className="py-3 px-6">${product.price.toFixed(2)}</td>
                                        <td className="py-3 px-6">{product.stockQuantity}</td>
                                        <td className="py-3 px-6">{product.supplierName}</td>
                                        <td className="py-3 px-6">
                                            <span
                                                className={`py-1 px-2 rounded text-xs ${
                                                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 flex justify-center space-x-2">
                                            <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
                ) : (
                    <div className="text-center py-4 text-gray-500">No products available</div>
                )}
            </div>
        </div>
    );
};

export default Products;