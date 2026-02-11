import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaTimes } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import Pagination from '../components/ui/Pagination';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const MaterialsPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Material Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);

    // Variants Modal State
    const [variantsModalOpen, setVariantsModalOpen] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState([]);
    const [selectedMaterialName, setSelectedMaterialName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        basePrice: '',
        discount: '',
        stock: '',
        variants: [], // Array of { id, size, price, discountPrice, stock }
        imageUrl: '',
        active: true,
    });
    const [formLoading, setFormLoading] = useState(false);

    // Variant State (for adding new variants)
    const [newVariant, setNewVariant] = useState({
        id: '',
        size: '',
        price: '',
        discountPrice: '',
        stock: ''
    });

    // Category Modal State
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        parentId: ''
    });
    const [categoryFormLoading, setCategoryFormLoading] = useState(false);

    // Image Preview State
    const [previewImage, setPreviewImage] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');

    const loadCategories = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_MATERIALS_CATEGORIES.GET_ALL, { size: 100 });
            setCategories(response.content || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: pageSize };
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.categoryId = selectedCategory;

            const response = await getPaginated(API_ENDPOINTS.ART_MATERIALS.GET_ALL, params);
            setItems(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || pageSize,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load materials');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm, selectedCategory, toast]);

    useEffect(() => {
        loadCategories();
        loadItems();
    }, [loadCategories, loadItems]);

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        setNewVariant({ id: '', size: '', price: '', discountPrice: '', stock: '' }); // Reset variant form

        if (mode === 'edit' && item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                categoryId: item.categoryId || '',
                basePrice: item.basePrice || '',
                discount: item.discount || 0,
                stock: item.stock || 0,
                variants: item.variants || [],
                imageUrl: item.imageUrl || '',
                active: item.active ?? true,
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                basePrice: '',
                discount: 0,
                stock: '',
                variants: [],
                imageUrl: '',
                active: true,
            });
        }
        setModalOpen(true);
    };

    const handleAddVariant = () => {
        if (!newVariant.id || !newVariant.size || !newVariant.price || !newVariant.stock) {
            toast.error('Please fill in required variant fields (ID, Size, Price, Stock)');
            return;
        }

        const variantToAdd = {
            id: newVariant.id,
            size: newVariant.size,
            price: parseFloat(newVariant.price),
            discountPrice: newVariant.discountPrice ? parseFloat(newVariant.discountPrice) : null,
            stock: parseInt(newVariant.stock)
        };

        setFormData({
            ...formData,
            variants: [...formData.variants, variantToAdd]
        });

        // Reset new variant inputs
        setNewVariant({ id: '', size: '', price: '', discountPrice: '', stock: '' });
    };

    const handleRemoveVariant = (indexToRemove) => {
        setFormData({
            ...formData,
            variants: formData.variants.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const requestData = {
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                basePrice: parseFloat(formData.basePrice),
                discount: parseFloat(formData.discount || 0),
                stock: parseInt(formData.stock || 0),
                variants: formData.variants,
                imageUrl: formData.imageUrl,
                active: formData.active,
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_MATERIALS.CREATE, requestData);
                toast.success('Material created');
            } else {
                await api.put(API_ENDPOINTS.ART_MATERIALS.UPDATE(selectedItem.id), requestData);
                toast.success('Material updated');
            }
            setModalOpen(false);
            loadItems();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setCategoryFormLoading(true);
        try {
            await api.post(API_ENDPOINTS.ART_MATERIALS_CATEGORIES.CREATE, categoryFormData);
            toast.success('Category created successfully');
            setCategoryModalOpen(false);
            setCategoryFormData({ name: '', parentId: '' });
            loadCategories(); // Refresh categories list
        } catch (error) {
            toast.error(error.message || 'Failed to create category');
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this material?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_MATERIALS.DELETE(id));
            toast.success('Material deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const openVariantsModal = (item) => {
        setSelectedVariants(item.variants || []);
        setSelectedMaterialName(item.name);
        setVariantsModalOpen(true);
    };

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Art Materials</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage art supplies inventory</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                        <FaPlus /> Add Category
                    </Button>
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Material
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        className="w-full"
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select
                        placeholder="Filter by Category"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                    />
                </div>
            </div>

            {
                loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                                {/* Image Header */}
                                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <img
                                        src={item.imageUrl || 'https://via.placeholder.com/300?text=Material'}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                        onClick={() => {
                                            setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=Material');
                                            setPreviewTitle(item.name);
                                        }}
                                    />
                                    {item.discount > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                            -{item.discount}%
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded text-xs font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                        {item.categoryName || 'Uncategorized'}
                                    </div>
                                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow-sm ${item.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {item.active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-4 space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-1" title={item.name}>
                                        {item.name}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
                                        {item.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs">Price</div>
                                            <div className="font-bold text-gray-800 dark:text-white">₹{item.basePrice}</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs">Stock</div>
                                            <div className={`font-bold ${item.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                {item.stock}
                                            </div>
                                        </div>
                                    </div>

                                    {item.variants?.length > 0 && (
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <FaLayerGroup /> {item.variants.length} Variants
                                            </div>
                                            <button
                                                onClick={() => openVariantsModal(item)}
                                                className="text-purple-600 hover:text-purple-700 hover:underline font-medium flex items-center gap-1"
                                            >
                                                View All
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2 gap-2 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => openModal('edit', item)}
                                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            <Pagination
                pagination={pagination}
                onPageChange={(newPage) => setPage(newPage)}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(0);
                }}
            />

            {/* Material Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create Material' : 'Edit Material'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={formLoading}>{modalMode === 'create' ? 'Create' : 'Save Changes'}</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Category"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        options={categoryOptions}
                        placeholder="Select Category"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Base Price (₹)"
                            type="number"
                            step="0.01"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                            required
                        />
                        <Input
                            label="Total Stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Discount (%)"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    />

                    {/* Variants Section */}
                    <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Variants (Optional)</label>

                        {/* List Existing Variants */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm text-sm">
                                        <span className="text-gray-800 dark:text-gray-200">
                                            <span className="font-bold text-gray-900 dark:text-white">{variant.id}</span>: {variant.size} - ₹{variant.price} ({variant.stock} in stock)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Variant Fields */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                            <Input
                                placeholder="ID (e.g. var_01)"
                                value={newVariant.id}
                                onChange={(e) => setNewVariant({ ...newVariant, id: e.target.value })}
                            />
                            <Input
                                placeholder="Size/Type"
                                value={newVariant.size}
                                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                            />
                            <Input
                                placeholder="Price"
                                type="number"
                                value={newVariant.price}
                                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                            />
                            <Input
                                placeholder="Disc. Price"
                                type="number"
                                value={newVariant.discountPrice}
                                onChange={(e) => setNewVariant({ ...newVariant, discountPrice: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Stock"
                                    type="number"
                                    value={newVariant.stock}
                                    onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                />
                                <Button type="button" size="sm" onClick={handleAddVariant}>
                                    <FaPlus />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />

                    <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                </form>
            </Modal>

            {/* Create Category Modal */}
            <Modal
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                title="Create New Category"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCategorySubmit} loading={categoryFormLoading}>Create Category</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Category Name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        required
                        placeholder="Enter category name"
                    />

                    <Input
                        label="Parent Category ID (Optional)"
                        value={categoryFormData.parentId}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, parentId: e.target.value })}
                        placeholder="Enter parent ID if applicable"
                    />
                </form>
            </Modal>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title={previewTitle}
            />

            {/* Variants View Modal */}
            <Modal
                isOpen={variantsModalOpen}
                onClose={() => setVariantsModalOpen(false)}
                title={`Variants: ${selectedMaterialName}`}
                size="lg"
                footer={
                    <Button onClick={() => setVariantsModalOpen(false)}>Close</Button>
                }
            >
                {selectedVariants.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Size/Type</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Disc. Price</th>
                                    <th className="px-4 py-3 text-right">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedVariants.map((variant, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{variant.id}</td>
                                        <td className="px-4 py-3">{variant.size}</td>
                                        <td className="px-4 py-3 text-right">₹{variant.price}</td>
                                        <td className="px-4 py-3 text-right">
                                            {variant.discountPrice ? `₹${variant.discountPrice}` : '-'}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-bold ${variant.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                                            {variant.stock}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No variants available for this material.
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default MaterialsPage;
