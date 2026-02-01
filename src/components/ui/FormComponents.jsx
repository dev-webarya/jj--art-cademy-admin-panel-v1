/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, variant }) => {
    const statusStyles = {
        // Enrollment statuses
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',

        // Order statuses
        PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',

        // Session statuses
        SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        IN_PROGRESS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',

        // Subscription statuses
        ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',

        // Generic variants
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const style = statusStyles[status] || statusStyles[variant] || statusStyles.default;

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
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
        primary: 'btn-gradient text-white',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-green-500 text-white hover:bg-green-600',
        ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <input
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none transition-all ${error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <select
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none transition-all ${error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
        )}
        <textarea
            rows={rows}
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none transition-all resize-none ${error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
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
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}
        {...props}
    >
        {children}
    </div>
);

/**
 * Stats Card Component
 */
export const StatsCard = ({ title, value, icon: Icon, trend, color = 'purple' }) => {
    const colors = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-amber-500',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 card-premium">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
                    {Icon && <Icon className="text-white text-xl" />}
                </div>
                {trend && (
                    <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    );
};
