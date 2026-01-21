import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Hotel,
    Users,
    FileBadge,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AppLayout() {
    const { signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Access Control: Force logout if profile is deleted
    useEffect(() => {
        const checkProfile = async () => {
            if (user && !loading) {
                // If we have a user session but no profile data after loading, they are effectively "deleted"
                const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();

                if (error || !data) {
                    await signOut();
                    navigate('/login');
                }
            }
        };
        checkProfile();
    }, [user, loading, signOut, navigate]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Bookings', href: '/bookings', icon: FileText },
        { name: 'Quotations', href: '/quotations', icon: FileBadge },
        { name: 'Properties', href: '/properties', icon: Hotel },
        ...(role === 'admin' ? [
            { name: 'Consultants', href: '/users', icon: Users },
            { name: 'Reports', href: '/reports', icon: Settings }
        ] : []),
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-border/40">
            <div className="p-6 pb-2 flex justify-center relative">
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-6 w-6" />
                </button>
                <img src="/assets/logo.png" alt="H&H Travel" className="h-24 md:h-32 w-auto object-contain" />
            </div>

            <div className="px-3 py-2 flex-1 overflow-y-auto">
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform</p>
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/5 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "mr-3 h-4 w-4 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                {item.name}
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto border-t border-border/40 p-4">
                {role === 'admin' && (
                    <Link to="/settings" className="flex items-center mb-4 px-2 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer group">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                        </div>
                    </Link>
                )}
                {role !== 'admin' && (
                    <div className="flex items-center mb-4 px-2 p-2 rounded-md">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex font-sans text-foreground">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 fixed h-full z-10">
                <SidebarContent />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-border/40 h-16 flex items-center justify-between px-4 z-20">
                <img src="/assets/logo.png" alt="H&H Travel" className="h-8 w-auto object-contain" />
                <button onClick={() => setIsMobileOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300 flex flex-col h-full">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 md:ml-64 bg-background min-h-screen pt-16 md:pt-0">
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
