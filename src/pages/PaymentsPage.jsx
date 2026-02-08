import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaMoneyBillWave } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const PaymentsPage = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]); // We fetch orders to show payments
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadPayments = useCallback(async () => {
        setLoading(true);
        try {
            // Since there is no specific "Get All Payments" endpoint, 
            // we use Orders endpoint as it contains payment status/details.
            const response = await getPaginated(API_ENDPOINTS.ORDERS.GET_ALL, { page, size: 20 });
            setOrders(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const columns = [
        { key: 'id', label: 'Order ID', render: (val) => val?.slice(0, 8) + '...' },
        { key: 'customerName', label: 'Customer', sortable: true, render: (val, row) => val || row.userName || '-' },
        {
            key: 'paymentStatus',
            label: 'Payment Status',
            render: (val, row) => <StatusBadge status={val || row.status} />
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            render: (val) => val ? `₹${parseFloat(val).toFixed(2)}` : '-'
        },
        { key: 'paymentMethod', label: 'Method', render: (val) => val || '-' },
        {
            key: 'createdAt',
            label: 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => openModal(row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View Details">
                        <FaEye />
                    </button>
                    {/* Placeholder for future verification/refund actions */}
                </div>
            ),
        },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Payments</h1>
                <p className="text-gray-600 dark:text-gray-400">View and manage order payments</p>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
            />

            {/* Payment Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Payment Details"
                size="md"
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-xl">
                                <FaMoneyBillWave />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                    ₹{selectedOrder.totalAmount?.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Payment Status</p>
                                <StatusBadge status={selectedOrder.paymentStatus || selectedOrder.status} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Order ID</p>
                                <p className="font-medium dark:text-white">{selectedOrder.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Customer</p>
                                <p className="font-medium dark:text-white">{selectedOrder.customerName || selectedOrder.userName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Transaction ID</p>
                                <p className="font-mono text-sm dark:text-gray-300 break-all">
                                    {selectedOrder.paymentId || selectedOrder.transactionId || 'N/A'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Method</p>
                                <p className="font-medium dark:text-white">
                                    {selectedOrder.paymentMethod || 'Online'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PaymentsPage;
