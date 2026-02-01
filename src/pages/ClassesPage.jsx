import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaClock, FaUserGraduate } from 'react-icons/fa';
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
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

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

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Art Classes</h1>
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                            {/* Image Header */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=No+Image');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                    {item.categoryName || 'Uncategorized'}
                                </div>
                                {item.discountPrice < item.basePrice && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                        Save ₹{(item.basePrice - item.discountPrice).toFixed(0)}
                                    </div>
                                )}
                            </div>

                            {/* Content Body */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                        {item.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
                                    {item.description}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <FaClock className="text-purple-500" /> {item.durationWeeks} Weeks
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaUserGraduate className="text-blue-500" /> {item.proficiency}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs text-gray-500 underline">Price</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{item.discountPrice || item.basePrice}
                                            </span>
                                            {item.discountPrice && (
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
        </div >
    );
};

export default ClassesPage;
