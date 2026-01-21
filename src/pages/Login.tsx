import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
    const [location] = useState(window.location);
    const queryParams = new URLSearchParams(location.search);
    const signupMode = queryParams.get('signup') === 'true';
    const invitedEmail = queryParams.get('email') || '';

    const [isLogin, setIsLogin] = useState(!signupMode);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(invitedEmail);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { session } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    if (session) {
        navigate('/');
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        data: {
                            full_name: `${firstName} ${lastName}`.trim(),
                        }
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-gray-900">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-20 xl:p-24 relative">



                <div className="w-full max-w-md mx-auto lg:mx-0">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900">
                        {isLogin ? 'Welcome back !' : 'Create Account !'}
                    </h1>
                    {/* User requested to remove text below welcome back - keeping this empty spacer or just removing it. */}
                    <div className="mb-8"></div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm placeholder:text-gray-400"
                                placeholder="Enter your mail address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm placeholder:text-gray-400 pr-10"
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot options */}
                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember_me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember_me" className="ml-2 block text-sm font-medium text-slate-700 leading-none">
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot your password?
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[#544AF4] hover:bg-[#453CC9] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center text-sm tracking-wide"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Log In' : 'Register')}
                        </button>
                    </form>

                    {/* Footer / Toggle */}
                    <div className="mt-8 text-center text-sm font-medium">
                        <span className="text-gray-600">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#544AF4] hover:text-[#453CC9] underline transition-colors"
                        >
                            {isLogin ? "Register here" : "Log in here"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gray-100">
                <img
                    src="/assets/login-hero.jpg"
                    alt="Wild Lion in Field"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
