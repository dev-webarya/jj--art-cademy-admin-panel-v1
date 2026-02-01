import { useState, useEffect } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Reusable DataTable Component with sorting, pagination, and search
 */
const DataTable = ({
    columns,
    data = [],
    loading = false,
    pagination = null,
    onPageChange,
    onSearch,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data found',
    actions,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch?.(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Handle sort
    const handleSort = (key) => {
        if (!key) return;
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Sort data locally if no server-side sorting
    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? (
            <FaSortUp className="text-purple-500" />
        ) : (
            <FaSortDown className="text-purple-500" />
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Search & Actions Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border-none outline-none text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        {col.sortable && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="spinner"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, idx) => (
                                <tr key={row.id || idx} className="table-row-hover transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {pagination.number * pagination.size + 1} to{' '}
                        {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of{' '}
                        {pagination.totalElements} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.number - 1)}
                            disabled={pagination.number === 0}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <FaChevronLeft />
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            Page {pagination.number + 1} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange?.(pagination.number + 1)}
                            disabled={pagination.number >= pagination.totalPages - 1}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
