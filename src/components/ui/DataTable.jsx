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
        if (sortConfig.key !== key) return <FaSort className="text-gray-300 dark:text-gray-600" />;
        return sortConfig.direction === 'asc' ? (
            <FaSortUp className="text-[#2383e2]" />
        ) : (
            <FaSortDown className="text-[#2383e2]" />
        );
    };

    return (
        <div className="bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-[#2f2f2f] overflow-hidden">
            {/* Search & Actions Bar */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2f2f2f] flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-56">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#2c2c2c] rounded-md border border-gray-200 dark:border-[#3d3d3d] outline-none text-sm text-gray-700 dark:text-gray-300 focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]/20 transition-colors"
                    />
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-[#2f2f2f]">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    className={`px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="spinner"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, idx) => (
                                <tr key={row.id || idx} className="table-row-hover border-b border-gray-50 dark:border-[#2a2a2a] last:border-none transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-2.5 whitespace-nowrap text-[13px] text-gray-700 dark:text-gray-300">
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
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-[#2f2f2f] flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {pagination.number * pagination.size + 1}–{Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of{' '}
                        {pagination.totalElements}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange?.(pagination.number - 1)}
                            disabled={pagination.number === 0}
                            className="p-1.5 rounded text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
                        >
                            <FaChevronLeft className="text-xs" />
                        </button>
                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                            {pagination.number + 1} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange?.(pagination.number + 1)}
                            disabled={pagination.number >= pagination.totalPages - 1}
                            className="p-1.5 rounded text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
                        >
                            <FaChevronRight className="text-xs" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
