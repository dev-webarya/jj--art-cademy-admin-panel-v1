/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, variant }) => {
    const statusStyles = {
        // Enrollment statuses
        PENDING: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40',
        APPROVED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40',
        REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/40',
        CANCELLED: 'bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700/40',

        // Order statuses
        PAYMENT_PENDING: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40',
        PROCESSING: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
        SHIPPED: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40',
        DELIVERED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40',

        // Session statuses
        SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
        IN_PROGRESS: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40',
        COMPLETED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40',

        // Subscription statuses
        ACTIVE: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40',
        EXPIRED: 'bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700/40',

        // Generic variants
        success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40',
        warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40',
        error: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/40',
        info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
        default: 'bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700/40',
    };

    const style = statusStyles[status] || statusStyles[variant] || statusStyles.default;

    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${style}`}>
            {status?.replace(/_/g, ' ') || 'Unknown'}
        </span>
    );
};

/**
 * Button Components
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'bg-[#2383e2] text-white hover:bg-[#0b6cd8]',
        secondary: 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#363636] border border-gray-200 dark:border-[#3d3d3d]',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-green-600 text-white hover:bg-green-700',
        ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2c]',
    };

    const sizes = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-sm',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {children}
        </button>
    );
};

/**
 * Input Components
 */
export const Input = ({
    label,
    error,
    className = '',
    ...props
}) => (
    <div className={className}>
        {label && (
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <input
            className={`w-full px-3 py-1.5 rounded-md border bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 text-sm outline-none transition-colors ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 dark:border-[#3d3d3d] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]/20'
                }`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Select = ({
    label,
    options = [],
    error,
    className = '',
    placeholder = 'Select...',
    ...props
}) => (
    <div className={className}>
        {label && (
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <select
            className={`w-full px-3 py-1.5 rounded-md border bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 text-sm outline-none transition-colors ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 dark:border-[#3d3d3d] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]/20'
                }`}
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Textarea = ({
    label,
    error,
    className = '',
    rows = 4,
    ...props
}) => (
    <div className={className}>
        {label && (
            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <textarea
            rows={rows}
            className={`w-full px-3 py-1.5 rounded-md border bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 text-sm outline-none transition-colors resize-none ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 dark:border-[#3d3d3d] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]/20'
                }`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

/**
 * Card Component
 */
export const Card = ({ children, className = '', ...props }) => (
    <div
        className={`bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-[#2f2f2f] ${className}`}
        {...props}
    >
        {children}
    </div>
);

/**
 * Stats Card Component
 */
export const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colors = {
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
        orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    };

    return (
        <div className="bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-[#2f2f2f] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-md ${colors[color]} flex items-center justify-center`}>
                    {Icon && <Icon className="text-sm" />}
                </div>
                {trend && (
                    <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">{value}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    );
};
