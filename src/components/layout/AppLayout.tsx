import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { OfflineNotice } from '../ui/OfflineNotice';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Hotel,
    Users,
    FileBadge,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    Utensils,
    BedDouble,
    LayoutGrid,
    Calendar as CalendarIcon,
    Check,
    Ban
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AppLayout() {
    const { signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Init theme from system or local storage could be added here
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // setIsDark(true); // Optional: default to dark if system is dark
        }
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Access Control: Force logout if profile is deleted
    useEffect(() => {
        const checkProfile = async () => {
            if (user && !loading) {
                const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();
                if (error || !data) {
                    await signOut();
                    navigate('/login');
                }
            }
        };
        checkProfile();
    }, [user, loading, signOut, navigate]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navigation = [

        // { name: 'Dashboard', href: '/', icon: LayoutDashboard }, // Moved to admin check
        { name: 'Booking Voucher', href: '/bookings', icon: FileText },
        { name: 'Quotation Voucher', href: '/quotations', icon: FileBadge },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
        { name: 'Properties', href: '/properties', icon: Hotel },
        ...(role === 'admin' ? [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'Consultants', href: '/users', icon: Users },
            { name: 'Reports', href: '/reports', icon: Settings }
        ] : []),
    ];

    const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className={cn("flex flex-col h-full bg-card border-r border-border transition-all duration-300", collapsed ? "w-20" : "w-64")}>
            <div className={cn("flex items-center relative", collapsed ? "justify-center p-4" : "px-6 py-6 pb-2")}>
                {/* Desktop Toggle Button */}
                {!isMobileOpen && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex absolute -right-3 top-8 h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors z-50"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                )}

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-6 w-6" />
                </button>

                {collapsed ? (
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                        H
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                            H
                        </div>
                        <span className="font-bold text-xl tracking-tight">H&H Travel</span>
                    </div>
                )}
            </div>

            <div className="px-3 py-6 flex-1 overflow-y-auto">
                {!collapsed && <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform</p>}
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    collapsed && "justify-center px-0"
                                )}
                                title={collapsed ? item.name : undefined}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground",
                                    !collapsed && "mr-3"
                                )} />
                                {!collapsed && item.name}
                            </Link>
                        );
                    })}
                </nav>
                {!collapsed && (
                    <>
                        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-6">Configurations</p>
                        <nav className="space-y-1">
                            <Link
                                to="/settings/meal-plans"
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    location.pathname === "/settings/meal-plans"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Utensils className={cn("h-5 w-5 mr-3 transition-colors", location.pathname === "/settings/meal-plans" ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                Meal Plans
                            </Link>
                            <Link
                                to="/settings/room-types"
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    location.pathname === "/settings/room-types"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <LayoutGrid className={cn("h-5 w-5 mr-3 transition-colors", location.pathname === "/settings/room-types" ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                Room Types
                            </Link>
                            <Link
                                to="/settings/bed-types"
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    location.pathname === "/settings/bed-types"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <BedDouble className={cn("h-5 w-5 mr-3 transition-colors", location.pathname === "/settings/bed-types" ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                Bed Types
                            </Link>
                            <Link
                                to="/settings/inclusions"
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    location.pathname === "/settings/inclusions"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Check className={cn("h-5 w-5 mr-3 transition-colors", location.pathname === "/settings/inclusions" ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                Inclusions
                            </Link>
                            <Link
                                to="/settings/exclusions"
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    location.pathname === "/settings/exclusions"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Ban className={cn("h-5 w-5 mr-3 transition-colors", location.pathname === "/settings/exclusions" ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                                Exclusions
                            </Link>
                        </nav>
                    </>
                )}
            </div>

            <div className="mt-auto p-4 border-t border-border/40 space-y-2">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={cn(
                        "flex items-center w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                        "text-muted-foreground hover:bg-muted hover:text-foreground",
                        collapsed && "justify-center"
                    )}
                >
                    {isDark ? <Sun className={cn("h-5 w-5", !collapsed && "mr-3")} /> : <Moon className={cn("h-5 w-5", !collapsed && "mr-3")} />}
                    {!collapsed && "Dark Mode"}
                </button>

                {role === 'admin' && (
                    <Link to="/settings" className={cn("flex items-center px-2 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer group", collapsed && "justify-center")}>
                        <div className="h-8 w-8 min-w-[2rem] rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{role}</p>
                            </div>
                        )}
                    </Link>
                )}
                {role !== 'admin' && (
                    <div className={cn("flex items-center px-2 p-2 rounded-md", collapsed && "justify-center")}>
                        <div className="h-8 w-8 min-w-[2rem] rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{role}</p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSignOut}
                    className={cn(
                        "flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
                    {!collapsed && "Sign Out"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-foreground overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className={cn("hidden md:block fixed h-full z-30 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
                <SidebarContent collapsed={isCollapsed} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-border h-16 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">H</div>
                    <span className="font-bold text-lg">H&H Travel</span>
                </div>
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
                    <div className="absolute inset-y-0 left-0 w-72 bg-background shadow-xl animate-in slide-in-from-left duration-300 flex flex-col h-full">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={cn(
                "flex-1 min-h-screen transition-all duration-300 pt-16 md:pt-0",
                isCollapsed ? "md:ml-20" : "md:ml-64"
            )}>
                <OfflineNotice />
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
