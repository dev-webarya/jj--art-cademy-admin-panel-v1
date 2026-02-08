import { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import api from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';
import { useToast } from './ui/Toast';
import { Button, Input } from './ui/FormComponents';

const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
    const toast = useToast();
    const [step, setStep] = useState(1); // 1: Select User, 2: Select Items, 3: Review
    const [loading, setLoading] = useState(false);
    
    // User Selection State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Product Selection State
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productType, setProductType] = useState('ART_WORK'); // ART_WORK or MATERIAL
    const [cartItems, setCartItems] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Shipping Info
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setStep(1);
            setSelectedUser(null);
            setCartItems([]);
            setShippingAddress('');
        }
    }, [isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isOpen && step === 1) fetchUsers(userSearch);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [userSearch, step]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isOpen && step === 2) fetchProducts(productSearch, productType);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [productSearch, productType, step]);

    const fetchUsers = async (query = '') => {
        setLoadingUsers(true);
        try {
            const params = { page: 0, size: 10 };
            if (query) params.search = query;
            const res = await api.get(API_ENDPOINTS.USERS.GET_ALL, { params });
            setUsers(res.data?.content || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchProducts = async (query = '', type) => {
        setLoadingProducts(true);
        try {
            const endpoint = type === 'ART_WORK' 
                ? API_ENDPOINTS.ART_WORKS.GET_ALL 
                : API_ENDPOINTS.ART_MATERIALS.GET_ALL;
            
            const params = { page: 0, size: 20 };
            // Note: API might not support search for products yet based on spec, 
            // but we'll try or just filter client side if needed. 
            // For now assuming getAll returns list.
            
            const res = await api.get(endpoint, { params });
            let items = res.data?.content || [];
            
            if (query) {
                const lowerQuery = query.toLowerCase();
                items = items.filter(item => 
                    (item.title || item.name || '').toLowerCase().includes(lowerQuery)
                );
            }
            setProducts(items);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const addToCart = (product) => {
        const existing = cartItems.find(item => item.id === product.id && item.type === productType);
        if (existing) {
            toast.info('Item already in cart');
            return;
        }

        const newItem = {
            id: product.id,
            itemId: product.id, // For backend DTO
            name: product.title || product.name,
            price: product.price || 0,
            quantity: 1,
            type: productType,
            image: product.imageUrls?.[0] || product.imageUrl
        };
        setCartItems([...cartItems, newItem]);
    };

    const updateQuantity = (id, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async () => {
        if (!selectedUser || cartItems.length === 0) return;

        setLoading(true);
        try {
            const orderData = {
                userId: selectedUser.id,
                items: cartItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemType: item.type === 'ART_WORK' ? 'ART_WORK' : 'MATERIAL' // Adjust enum match
                })),
                shippingAddress: shippingAddress || selectedUser.address || 'Address not provided',
                notes: 'Created by Admin'
            };

            // Using createOrder endpoint
            await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
            toast.success('Order created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Create New Order</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                }`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`w-12 h-1 ${
                                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                } mx-2`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Select User */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold dark:text-white">Select Customer</h3>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    className="pl-10"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="border rounded-xl dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
                                {loadingUsers ? (
                                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                                ) : users.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="p-3 text-sm text-gray-500 dark:text-gray-400">Name</th>
                                                <th className="p-3 text-sm text-gray-500 dark:text-gray-400">Email</th>
                                                <th className="p-3 text-sm text-gray-500 dark:text-gray-400">Join Date</th>
                                                <th className="p-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} 
                                                    className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                                        selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <td className="p-3 dark:text-gray-200">{user.firstName} {user.lastName}</td>
                                                    <td className="p-3 text-gray-500">{user.email}</td>
                                                    <td className="p-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-3 text-right">
                                                        {selectedUser?.id === user.id && (
                                                            <span className="text-blue-600 font-bold">Selected</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">No users found.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Items */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex gap-4 mb-4">
                                <Button 
                                    variant={productType === 'ART_WORK' ? 'primary' : 'outline'}
                                    onClick={() => setProductType('ART_WORK')}
                                >
                                    Art Works
                                </Button>
                                <Button 
                                    variant={productType === 'MATERIAL' ? 'primary' : 'outline'}
                                    onClick={() => setProductType('MATERIAL')}
                                >
                                    Materials
                                </Button>
                            </div>

                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                    placeholder={`Search ${productType === 'ART_WORK' ? 'Art Works' : 'Materials'}...`}
                                    className="pl-10"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Available Products */}
                                <div className="border rounded-xl dark:border-gray-700 overflow-hidden h-96 flex flex-col">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 font-semibold dark:text-gray-200">
                                        Available Items
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                        {loadingProducts ? (
                                            <div className="text-center p-4 text-gray-500">Loading...</div>
                                        ) : products.map(item => (
                                            <div key={item.id} className="flex gap-3 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                    {(item.imageUrls?.[0] || item.imageUrl) && (
                                                        <img src={item.imageUrls?.[0] || item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate dark:text-gray-200">{item.title || item.name}</p>
                                                    <p className="text-sm text-gray-500">₹{item.price}</p>
                                                </div>
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cart */}
                                <div className="border rounded-xl dark:border-gray-700 overflow-hidden h-96 flex flex-col">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 font-semibold dark:text-gray-200 flex justify-between">
                                        <span>Selected Items ({cartItems.length})</span>
                                        <span>Total: ₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                        {cartItems.length === 0 ? (
                                            <div className="text-center p-8 text-gray-500">Cart is empty</div>
                                        ) : cartItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-2 border rounded-lg dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate dark:text-gray-200">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.type}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 bg-gray-200 rounded dark:bg-gray-600">-</button>
                                                    <span className="w-6 text-center dark:text-gray-200">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 bg-gray-200 rounded dark:bg-gray-600">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-1">
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-500 uppercase text-sm">Customer</h4>
                                    <p className="text-lg font-medium dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                                    <p className="text-gray-500">{selectedUser.email}</p>
                                    <p className="text-gray-500">{selectedUser.phoneNumber || 'No phone'}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-500 uppercase text-sm">Shipping Address</h4>
                                    <textarea
                                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        rows="3"
                                        placeholder="Enter shipping address..."
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                    />
                                    {!shippingAddress && selectedUser.address && (
                                        <button 
                                            onClick={() => setShippingAddress(selectedUser.address)}
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            Use User's Default Address
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-500 uppercase text-sm mb-3">Order Items</h4>
                                <div className="border rounded-xl dark:border-gray-700 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="p-3 text-sm text-gray-500">Item</th>
                                                <th className="p-3 text-sm text-gray-500 text-center">Type</th>
                                                <th className="p-3 text-sm text-gray-500 text-center">Qty</th>
                                                <th className="p-3 text-sm text-gray-500 text-right">Price</th>
                                                <th className="p-3 text-sm text-gray-500 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {cartItems.map((item, idx) => (
                                                <tr key={idx} className="dark:text-gray-300">
                                                    <td className="p-3 font-medium">{item.name}</td>
                                                    <td className="p-3 text-center text-sm text-gray-500">{item.type}</td>
                                                    <td className="p-3 text-center">{item.quantity}</td>
                                                    <td className="p-3 text-right">₹{item.price}</td>
                                                    <td className="p-3 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 dark:bg-gray-900 font-bold">
                                                <td colSpan="4" className="p-4 text-right">Total Amount:</td>
                                                <td className="p-4 text-right text-lg text-blue-600">₹{calculateTotal().toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    
                    {step < 3 ? (
                        <Button 
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !selectedUser) || (step === 2 && cartItems.length === 0)}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} isLoading={loading}>
                            Confirm Order
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateOrderModal;
