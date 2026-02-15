import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaClock, FaUserGraduate, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import Pagination from '../components/ui/Pagination';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const ClassesPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');

    // Class Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        discountPrice: '',
        durationWeeks: '',
        proficiency: '',
        categoryId: '',
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
            const response = await getPaginated(API_ENDPOINTS.ART_CLASSES_CATEGORIES.GET_ALL, { size: 100 });
            setCategories(response.content || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    // Fetch Classes
    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_CLASSES.GET_ALL, { page, size: pageSize });
            setItems(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || pageSize,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load classes');
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
                basePrice: item.basePrice || '',
                discountPrice: item.discountPrice || '',
                durationWeeks: item.durationWeeks || '',
                proficiency: item.proficiency || '',
                categoryId: item.categoryId || '',
                imageUrl: item.imageUrl || '',
                active: item.active ?? true,
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                basePrice: '',
                discountPrice: '',
                durationWeeks: '',
                proficiency: 'Beginner',
                categoryId: '',
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
                basePrice: parseFloat(formData.basePrice),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                durationWeeks: parseInt(formData.durationWeeks),
                proficiency: formData.proficiency,
                categoryId: formData.categoryId,
                imageUrl: formData.imageUrl,
                active: formData.active,
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_CLASSES.CREATE, requestData);
                toast.success('Class created successfully');
            } else {
                await api.put(API_ENDPOINTS.ART_CLASSES.UPDATE(selectedItem.id), requestData);
                toast.success('Class updated successfully');
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
            await api.post(API_ENDPOINTS.ART_CLASSES_CATEGORIES.CREATE, categoryFormData);
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
        if (!confirm('Are you sure you want to delete this class?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_CLASSES.DELETE(id));
            toast.success('Class deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete class');
        }
    };

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const proficiencyOptions = [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' },
        { value: 'All Levels', label: 'All Levels' },
    ];

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(i =>
            (i.name || '').toLowerCase().includes(term) ||
            (i.description || '').toLowerCase().includes(term) ||
            (i.categoryName || '').toLowerCase().includes(term) ||
            (i.proficiency || '').toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Art Classes</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your art classes and workshops</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                        <FaPlus /> Add Category
                    </Button>
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Class
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search classes..."
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
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=No+Image');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                {/* Compact badges */}
                                <div className="absolute top-2 right-2 bg-white/95 dark:bg-[#1e1e1e]/95 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                    {item.categoryName || 'Uncategorized'}
                                </div>
                                {item.discountPrice < item.basePrice && (
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md animate-pulse">
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

                            {/* Content Body - Compact */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1" title={item.name}>
                                    {item.name}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 h-8 leading-tight">
                                    {item.description}
                                </p>

                                {/* Compact metadata with smaller icons */}
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
                                    <span className="flex items-center gap-1">
                                        <FaClock className="text-[10px] text-[#2383e2]" /> {item.durationWeeks}w
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaUserGraduate className="text-[10px] text-blue-500" /> {item.proficiency}
                                    </span>
                                </div>

                                {/* Compact price and actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2f2f2f]">
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                                ₹{item.discountPrice || item.basePrice}
                                            </span>
                                            {item.discountPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{item.basePrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Compact action buttons */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => navigate('/sessions', { state: { classId: item.id } })}
                                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title="View Sessions"
                                        >
                                            <FaCalendarAlt className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => openModal('edit', item)}
                                            className="p-1.5 text-gray-600 hover:text-[#2383e2] hover:bg-purple-50 dark:text-gray-400 dark:hover:bg-purple-900/30 rounded transition-colors"
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



            {/* Class Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create New Class' : 'Edit Class'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={formLoading}>{modalMode === 'create' ? 'Create Class' : 'Save Changes'}</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Class Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Category"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            options={categoryOptions}
                            placeholder="Select Category"
                            required
                        />
                        <Select
                            label="Proficiency Level"
                            value={formData.proficiency}
                            onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                            options={proficiencyOptions}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Input
                            label="Duration (Weeks)"
                            type="number"
                            value={formData.durationWeeks}
                            onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                            required
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
                        required
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

export default ClassesPage;
