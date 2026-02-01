import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Reusable Pagination Component
 * Displays "Showing X to Y of Z entries" and page navigation buttons.
 * Supports changing page size.
 */
const Pagination = ({
    pagination,
    onPageChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
}) => {
    // Only hide if pagination data is strictly missing (not loaded yet)
    if (!pagination) return null;

    const currentSize = pageSize || pagination.size || 20;
    const start = pagination.totalElements === 0 ? 0 : pagination.number * currentSize + 1;
    const end = Math.min((pagination.number + 1) * currentSize, pagination.totalElements);
    const totalPages = Math.max(1, pagination.totalPages || 0);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-gray-100 dark:border-gray-700 mt-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <p>
                    Showing <span className="font-semibold text-gray-900 dark:text-purple-100">{start}</span> to{' '}
                    <span className="font-semibold text-gray-900 dark:text-purple-100">{end}</span> of{' '}
                    <span className="font-semibold text-gray-900 dark:text-purple-100">{pagination.totalElements}</span> entries
                </p>

                {onPageSizeChange && (
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs">Rows per page:</span>
                        <select
                            value={currentSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-transparent border-none text-gray-700 dark:text-gray-200 text-sm focus:ring-0 cursor-pointer pr-8"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size} className="bg-white dark:bg-gray-800">
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(pagination.number - 1)}
                    disabled={pagination.number <= 0}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:shadow-none"
                    title="Previous Page"
                >
                    <FaChevronLeft />
                </button>

                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    Page {pagination.number + 1} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(pagination.number + 1)}
                    disabled={pagination.number >= totalPages - 1}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:shadow-none"
                    title="Next Page"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
