import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaPalette, FaUser, FaSearch } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import Pagination from '../components/ui/Pagination';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const ExhibitionsPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');

    // Exhibition Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        startDate: '',
        endDate: '',
        location: '',
        imageUrl: '',
        artistCount: 0,
        artworksCount: 0,
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

    const loadCategories = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_EXHIBITIONS_CATEGORIES.GET_ALL, { size: 100 });
            setCategories(response.content || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_EXHIBITIONS.GET_ALL, { page, size: pageSize });
            setItems(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || pageSize,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load exhibitions');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, toast]);

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
                startDate: item.startDate || '',
                endDate: item.endDate || '',
                location: item.location || '',
                imageUrl: item.imageUrl || '',
                artistCount: item.artistCount || 0,
                artworksCount: item.artworksCount || 0,
                active: item.active ?? true,
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                startDate: '',
                endDate: '',
                location: '',
                imageUrl: '',
                artistCount: 0,
                artworksCount: 0,
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
                ...formData,
                artistCount: parseInt(formData.artistCount),
                artworksCount: parseInt(formData.artworksCount),
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_EXHIBITIONS.CREATE, requestData);
                toast.success('Exhibition created');
            } else {
                await api.put(API_ENDPOINTS.ART_EXHIBITIONS.UPDATE(selectedItem.id), requestData);
                toast.success('Exhibition updated');
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
            await api.post(API_ENDPOINTS.ART_EXHIBITIONS_CATEGORIES.CREATE, categoryFormData);
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
        if (!confirm('Delete this exhibition?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_EXHIBITIONS.DELETE(id));
            toast.success('Exhibition deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(i =>
            (i.name || '').toLowerCase().includes(term) ||
            (i.description || '').toLowerCase().includes(term) ||
            (i.location || '').toLowerCase().includes(term) ||
            (i.categoryName || '').toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Exhibitions</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage art exhibitions and shows</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                        <FaPlus /> Add Category
                    </Button>
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Exhibition
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search exhibitions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2383e2] focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#252525] rounded-lg shadow-md hover:shadow-sm transition-all duration-300 overflow-hidden group">
                            {/* Image Header - Compact */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Exhibition'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=Exhibition');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                {/* Compact badges */}
                                <div className="absolute top-2 right-2 bg-white/95 dark:bg-[#1e1e1e]/95 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm">
                                    {item.categoryName}
                                </div>
                                {/* Gradient overlay with location */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <div className="flex items-center text-white text-[11px] font-medium">
                                        <FaMapMarkerAlt className="mr-1 text-red-400 text-[10px]" />
                                        <span className="line-clamp-1">{item.location}</span>
                                    </div>
                                </div>
                                {/* Status indicator */}
                                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm ${item.active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                                    }`}>
                                    {item.active ? '●' : '○'}
                                </div>
                            </div>

                            {/* Content Body - Compact */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1" title={item.name}>
                                    {item.name}
                                </h3>

                                {/* Dates - Compact */}
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <FaCalendarAlt className="mr-1.5 text-blue-500 text-[10px]" />
                                    <span className="line-clamp-1">
                                        {item.startDate ? new Date(item.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'}
                                        {' — '}
                                        {item.endDate ? new Date(item.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 h-8 leading-tight">
                                    {item.description}
                                </p>

                                {/* Compact stats */}
                                <div className="flex gap-3 text-xs text-gray-500 pt-1">
                                    <div className="flex items-center gap-1">
                                        <FaUser className="text-[#2383e2] text-[10px]" />
                                        <span className="font-semibold">{item.artistCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaPalette className="text-orange-500 text-[10px]" />
                                        <span className="font-semibold">{item.artworksCount}</span>
                                    </div>
                                </div>

                                {/* Compact actions */}
                                <div className="flex justify-end pt-2 gap-1 border-t border-gray-100 dark:border-[#2f2f2f]">
                                    <button
                                        onClick={() => openModal('edit', item)}
                                        className="p-1.5 text-gray-600 hover:text-[#2383e2] hover:bg-purple-50 dark:text-gray-400 dark:hover:bg-purple-900/30 rounded transition-colors"
                                    >
                                        <FaEdit className="text-sm" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 rounded transition-colors"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
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

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create Exhibition' : 'Edit Exhibition'}
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
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Artist Count"
                            type="number"
                            value={formData.artistCount}
                            onChange={(e) => setFormData({ ...formData, artistCount: e.target.value })}
                        />
                        <Input
                            label="Artworks Count"
                            type="number"
                            value={formData.artworksCount}
                            onChange={(e) => setFormData({ ...formData, artworksCount: e.target.value })}
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
        </div >
    );
};

export default ExhibitionsPage;
