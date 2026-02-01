import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaPalette, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="h-screen overflow-hidden flex bg-white dark:bg-gray-950 font-sans">
            {/* Left Side - Hero Image (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2186&auto=format&fit=crop"
                    alt="Artistic Abstract"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-purple-900/40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-black/60"></div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full p-16 flex flex-col justify-between h-full">
                    <div className="animate-fadeIn">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                <FaPalette className="text-pink-400 text-2xl" />
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">JJ Art Academy</span>
                        </div>
                    </div>

                    <div className="space-y-6 animate-fadeInUp">
                        <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Crafting the Future <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                of Digital Art
                            </span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                            Manage your creative empire with a suite of powerful tools designed for modern art education.
                        </p>
                    </div>

                    <div className="text-gray-400 text-sm font-medium flex items-center gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center overflow-hidden`}>
                                    <img src={`https://randomuser.me/api/portraits/thumb/women/${i + 10}.jpg`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <span>Joined by 10k+ Creators</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                {/* Mobile Background Decoration */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <img
                        src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2186&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-10"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white dark:from-gray-950/90 dark:to-gray-950"></div>
                </div>

                <div className="w-full max-w-md relative z-10 animate-fadeInUp">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="lg:hidden inline-flex items-center gap-2 mb-6 p-2 bg-purple-50 dark:bg-gray-800 rounded-lg">
                            <FaPalette className="text-purple-600 dark:text-purple-400" />
                            <span className="font-bold text-gray-900 dark:text-white text-sm">Art Academy</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome back</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                            <div className="mt-0.5">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                    Forgot password?
                                </a>
                            </div>
                            <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <FaLock />
                                </div>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || isLoading}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-current rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Feeling Good! <span className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline">Get Set Art</span>
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        Demo Credentials: admin@artacademy.com / Password@123
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
