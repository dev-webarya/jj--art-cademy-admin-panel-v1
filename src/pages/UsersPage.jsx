import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const UsersPage = () => {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit, view
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 20 };
            if (searchTerm) params.search = searchTerm;

            const response = await getPaginated(API_ENDPOINTS.USERS.GET_ALL, params);
            setUsers(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(0);
    };

    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (user && mode !== 'create') {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                password: '',
            });
        } else {
            setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.USERS.CREATE, formData);
                toast.success('User created successfully');
            } else if (modalMode === 'edit') {
                const { password, ...updateData } = formData;
                await api.put(API_ENDPOINTS.USERS.UPDATE(selectedUser.id), updateData);
                toast.success('User updated successfully');
            }
            setModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;
        try {
            await api.delete(API_ENDPOINTS.USERS.DELETE(user.id));
            toast.success('User deleted successfully');
            loadUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true, render: (val) => val?.slice(0, 8) + '...' },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-'
        },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phoneNumber', label: 'Phone', render: (val) => val || '-' },
        {
            key: 'roles',
            label: 'Role',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val?.includes('ROLE_ADMIN')
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                    {val?.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal('view', row)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                        <FaEye />
                    </button>
                    <button
                        onClick={() => openModal('edit', row)}
                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">User Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all registered users</p>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                onSearch={handleSearch}
                searchPlaceholder="Search users..."
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add User
                    </Button>
                }
            />

            {/* User Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create User' : modalMode === 'edit' ? 'Edit User' : 'User Details'}
                size="md"
                footer={
                    modalMode !== 'view' && (
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} loading={formLoading}>
                                {modalMode === 'create' ? 'Create' : 'Save Changes'}
                            </Button>
                        </>
                    )
                }
            >
                {modalMode === 'view' ? (
                    <div className="space-y-4">
                        <div><strong>Name:</strong> {selectedUser?.firstName} {selectedUser?.lastName}</div>
                        <div><strong>Email:</strong> {selectedUser?.email}</div>
                        <div><strong>Phone:</strong> {selectedUser?.phoneNumber || '-'}</div>
                        <div><strong>Role:</strong> {selectedUser?.roles?.join(', ') || 'User'}</div>
                        <div><strong>Roll No:</strong> {selectedUser?.rollNo || '-'}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                        {modalMode === 'create' && (
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        )}
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default UsersPage;
