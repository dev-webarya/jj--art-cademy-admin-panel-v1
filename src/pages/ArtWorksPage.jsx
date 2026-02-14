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
            // If searching, fetch all (large size) to filter client-side
            const isSearching = !!searchTerm;
            const params = {
                page: isSearching ? 0 : page,
                size: isSearching ? 1000 : pageSize
            };

            if (selectedCategory) params.categoryId = selectedCategory;

            const response = await getPaginated(API_ENDPOINTS.ART_WORKS.GET_ALL, params);
            let content = response.content || [];

            // Client-side filtering if search is active
            if (isSearching) {
                const term = searchTerm.toLowerCase();
                content = content.filter(item =>
                    (item.name || '').toLowerCase().includes(term) ||
                    (item.description || '').toLowerCase().includes(term) ||
                    (item.artistName || '').toLowerCase().includes(term)
                );
            }

            setItems(content);
            setPagination({
                number: isSearching ? 0 : (response.number || 0),
                size: isSearching ? content.length : (response.size || pageSize),
                totalElements: isSearching ? content.length : (response.totalElements || 0),
                totalPages: isSearching ? 1 : (response.totalPages || 1),
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
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Art Works</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#252525] rounded-lg shadow-md hover:shadow-sm transition-all duration-300 overflow-hidden group">
                            {/* Image Header */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Art+Work'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=Art+Work');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-white/95 dark:bg-[#1e1e1e]/95 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                    {item.categoryName || 'Uncategorized'}
                                </div>
                                {item.discountPrice && item.discountPrice < item.basePrice && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                        -{Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}%
                                    </div>
                                )}
                                {/* Status badge on image */}
                                <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm ${item.active
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-gray-500/90 text-white'
                                    }`}>
                                    {item.active ? '●' : '○'}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1" title={item.name}>
                                    {item.name}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 h-8 leading-tight">
                                    {item.description || 'No description available.'}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
                                    <span className="flex items-center gap-1">
                                        <FaUser className="text-[10px] text-[#2383e2]" /> {item.artistName || '-'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaPaintBrush className="text-[10px] text-orange-500" /> {item.artMedium || '-'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2f2f2f]">
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                                ₹{item.discountPrice || item.basePrice}
                                            </span>
                                            {item.discountPrice && item.discountPrice < item.basePrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{item.basePrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal('edit', item)}
                                            className="p-1.5 text-gray-600 hover:text-[#2383e2] hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash className="text-sm" />
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
                            className="rounded text-[#2383e2] focus:ring-[#2383e2]"
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
