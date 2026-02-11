import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPaintBrush, FaRulerCombined, FaUser } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import ImageUpload from '../components/ui/ImageUpload';
import Pagination from '../components/ui/Pagination';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const ArtWorksPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Art Work Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        artistName: '',
        artMedium: '',
        size: '',
        basePrice: '',
        discountPrice: '',
        imageUrl: '',
        active: true,
    });
    const [formLoading, setFormLoading] = useState(false);

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

    // Fetch Categories
    const loadCategories = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_WORKS_CATEGORIES.GET_ALL, { size: 100 });
            setCategories(response.content || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    // Fetch Items
    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: pageSize };
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.categoryId = selectedCategory;

            const response = await getPaginated(API_ENDPOINTS.ART_WORKS.GET_ALL, params);
            setItems(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || pageSize,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load art works');
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
        if (mode === 'edit' && item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                categoryId: item.categoryId || '',
                artistName: item.artistName || '',
                artMedium: item.artMedium || '',
                size: item.size || '',
                basePrice: item.basePrice || '',
                discountPrice: item.discountPrice || '',
                imageUrl: item.imageUrl || '',
                active: item.active ?? true,
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                artistName: '',
                artMedium: '',
                size: '',
                basePrice: '',
                discountPrice: '',
                imageUrl: '',
                active: true,
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const requestData = {
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                artistName: formData.artistName,
                artMedium: formData.artMedium,
                size: formData.size,
                basePrice: parseFloat(formData.basePrice),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                imageUrl: formData.imageUrl,
                active: formData.active,
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_WORKS.CREATE, requestData);
                toast.success('Art work created');
            } else {
                await api.put(API_ENDPOINTS.ART_WORKS.UPDATE(selectedItem.id), requestData);
                toast.success('Art work updated');
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
            await api.post(API_ENDPOINTS.ART_WORKS_CATEGORIES.CREATE, categoryFormData);
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
        if (!confirm('Delete this art work?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_WORKS.DELETE(id));
            toast.success('Art work deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Art Works</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage gallery art works collection</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                        <FaPlus /> Add Category
                    </Button>
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Art Work
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search artworks..."
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            {/* Image Header */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Art+Work'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=Art+Work');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                    {item.categoryName || 'Uncategorized'}
                                </div>
                                {item.discountPrice && item.discountPrice < item.basePrice && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                        Save ₹{(item.basePrice - item.discountPrice).toFixed(0)}
                                    </div>
                                )}
                                {/* Gradient overlay with artist name */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <div className="flex items-center text-white text-sm font-medium">
                                        <FaUser className="mr-2 text-purple-300" />
                                        {item.artistName || 'Unknown Artist'}
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <span className={`shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                        {item.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
                                    {item.description || 'No description available.'}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <FaPaintBrush className="text-orange-500" /> {item.artMedium || '-'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaRulerCombined className="text-blue-500" /> {item.size || '-'}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Price</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{item.discountPrice || item.basePrice}
                                            </span>
                                            {item.discountPrice && item.discountPrice < item.basePrice && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{item.basePrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal('edit', item)}
                                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination
                pagination={pagination}
                onPageChange={(newPage) => setPage(newPage)}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(0);
                }}
            />

            {/* Create/Edit Art Work Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create Art Work' : 'Edit Art Work'}
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
                        label="Title"
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
                            label="Artist Name"
                            value={formData.artistName}
                            onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                            required
                        />
                        <Input
                            label="Art Medium"
                            value={formData.artMedium}
                            onChange={(e) => setFormData({ ...formData, artMedium: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Size"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            placeholder="e.g. 24x36"
                        />
                        <Input
                            label="Base Price (₹)"
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                            required
                        />
                        <Input
                            label="Discount Price (₹)"
                            type="number"
                            value={formData.discountPrice}
                            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        />
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active / For Sale</span>
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
        </div >
    );
};

export default ArtWorksPage;
