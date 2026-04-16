import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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

    Utensils,
    BedDouble,
    LayoutGrid,
    Calendar as CalendarIcon,
    Shield,
    Check,
    Ban,
    FileCheck,
    ChevronDown,
    BarChart3,
    TrainFront
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Component defined outside to prevent re-creation on every render, 
// which ensures state stability and prevents hooks logic from resetting.
function SidebarContent({
    isMobileOpen,
    setIsMobileOpen,
    isCollapsed,
    setIsCollapsed,
    navigation,
    location,
    expandedMenus,
    toggleMenu,
    handleSignOut,
    user,
    role
}: {
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    navigation: any[];
    location: any;
    expandedMenus: Record<string, boolean>;
    toggleMenu: (name: string) => void;
    handleSignOut: () => void;
    user: any;
    role: string | null;
}) {
    return (
        <div className={cn("flex flex-col h-full segmented-sidebar transition-all duration-500 relative z-10 rounded-[2.5rem] shadow-2xl border border-white/20", isCollapsed ? "w-20" : "w-64")}>
            <div className={cn("flex items-center relative z-20", isCollapsed ? "justify-center p-4 px-2" : "px-6 py-8 pb-4")}>
                {/* Desktop Toggle Button */}
                {!isMobileOpen && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex absolute -right-3 top-8 h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors z-50"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                )}

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-6 w-6" />
                </button>

                {isCollapsed ? (
                    <div className="h-10 w-10 flex items-center justify-center text-primary font-black text-2xl">
                        H
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-6 py-4">
                        <span className="font-black text-3xl tracking-tighter text-foreground">H&H</span>
                    </div>
                )}
            </div>

            <div className="px-3 py-6 flex-1 overflow-y-auto">
                {!isCollapsed && <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform</p>}
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isChildActive = item.children?.some((child: any) => location.pathname.startsWith(child.href));
                        const isActive = item.href
                            ? (item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href))
                            : isChildActive;

                        if (item.children) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => !isCollapsed && toggleMenu(item.name)}
                                        className={cn(
                                            "flex items-center w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 group relative select-none z-20 segmented-item-hover",
                                            isActive || expandedMenus[item.name]
                                                ? "text-brand-700 bg-white/40"
                                                : "text-muted-foreground hover:text-foreground",
                                            isCollapsed && "justify-center px-0"
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-all duration-300 flex-shrink-0 group-hover:scale-110",
                                            isActive || expandedMenus[item.name] ? "text-brand-600" : "text-muted-foreground group-hover:text-brand-500",
                                            !isCollapsed && "mr-3"
                                        )} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left">{item.name}</span>
                                                <ChevronDown className={cn(
                                                    "h-4 w-4 transition-transform duration-300 opacity-50",
                                                    expandedMenus[item.name] ? "transform rotate-180" : ""
                                                )} />
                                            </>
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {!isCollapsed && expandedMenus[item.name] && (
                                        <div className="pl-4 space-y-1 animate-accordion-down overflow-hidden z-20 relative">
                                            {item.children.map((child: any) => {
                                                const isChildActive = location.pathname.startsWith(child.href);
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        to={child.href}
                                                        className={cn(
                                                            "flex items-center pl-3 pr-3 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative group segmented-item-hover",
                                                            isChildActive
                                                                ? "segmented-active segmented-active-text"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.href!}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-500 group relative z-20",
                                    isActive
                                        ? "segmented-active segmented-active-text"
                                        : "text-muted-foreground hover:text-foreground segmented-item-hover",
                                    isCollapsed && "justify-center px-0"
                                 )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-all duration-500",
                                    isActive ? "segmented-active-text scale-110" : "text-muted-foreground group-hover:text-brand-500",
                                    !isCollapsed && "mr-3"
                                )} />
                                {!isCollapsed && item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-white/10 space-y-2 z-20 relative">
                {role === 'admin' && (
                    <Link to="/settings" className={cn("flex items-center px-2 bg-white/40 p-2.5 rounded-3xl transition-all duration-500 cursor-pointer group hover:bg-white/60 hover:scale-[1.02] active:scale-[0.98]", isCollapsed && "justify-center")}>
                        <div className="h-9 w-9 min-w-[2.25rem] rounded-full bg-brand-100 flex items-center justify-center text-xs font-black text-brand-700 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 shadow-sm border border-brand-200/50">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-black text-foreground truncate group-hover:text-brand-700 transition-colors">{user?.email}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">{role}</p>
                            </div>
                        )}
                    </Link>
                )}
                {role !== 'admin' && (
                    <div className={cn("flex items-center px-2 bg-white/40 p-2.5 rounded-3xl", isCollapsed && "justify-center")}>
                        <div className="h-9 w-9 min-w-[2.25rem] rounded-full bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-black text-foreground truncate">{user?.email}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">{role}</p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSignOut}
                    className={cn(
                        "flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && "Sign Out"}
                </button>
            </div>
        </div>
    );
}

export default function AppLayout() {
    const { signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const navigation = useMemo(() => [
        {
            name: 'Vouchers',
            icon: FileText,
            children: [
                { name: 'Booking Voucher', href: '/bookings', icon: FileText },
                { name: 'Quotation Voucher', href: '/quotations', icon: FileBadge },
                { name: 'Confirmation Voucher', href: '/confirmations', icon: FileCheck },
                { name: 'Train Receipt', href: '/trains', icon: TrainFront },
            ]
        },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
        ...(role === 'admin' ? [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            {
                name: 'Administration',
                icon: Shield,
                children: [
                    { name: 'Users', href: '/users', icon: Users },
                    { name: 'Reports', href: '/reports', icon: BarChart3 },
                ]
            },
            {
                name: 'Configurations',
                icon: Settings,
                children: [
                    { name: 'Properties', href: '/properties', icon: Hotel },
                    { name: 'Meal Plans', href: '/settings/meal-plans', icon: Utensils },
                    { name: 'Room Types', href: '/settings/room-types', icon: LayoutGrid },
                    { name: 'Bed Types', href: '/settings/bed-types', icon: BedDouble },
                    { name: 'Inclusions', href: '/settings/inclusions', icon: Check },
                    { name: 'Exclusions', href: '/settings/exclusions', icon: Ban },
                ]
            }
        ] : []),
    ], [role]);

    // Auto-expand menu on initial load or path change if a child is active
    useEffect(() => {
        let changed = false;
        const newExpanded = { ...expandedMenus };
        
        navigation.forEach(item => {
            if (item.children) {
                const isChildActive = item.children.some((child: any) => location.pathname.startsWith(child.href));
                if (isChildActive && !newExpanded[item.name]) {
                    newExpanded[item.name] = true;
                    changed = true;
                }
            }
        });

        if (changed) {
            setExpandedMenus(newExpanded);
        }
    }, [location.pathname, navigation]);

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

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


    const sidebarProps = {
        isMobileOpen,
        setIsMobileOpen,
        isCollapsed,
        setIsCollapsed,
        navigation,
        location,
        expandedMenus,
        toggleMenu,
        handleSignOut,
        user,
        role
    };

    return (
        <div className={cn("min-h-screen flex font-sans text-foreground overflow-x-hidden bg-mesh")}>
            {/* Desktop Sidebar */}
            <div className={cn("hidden md:block fixed h-screen z-40 transition-all duration-500 p-4", isCollapsed ? "w-28" : "w-72")}>
                <SidebarContent {...sidebarProps} />
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
                    <div className="absolute inset-y-0 left-0 w-72 bg-transparent shadow-xl animate-in slide-in-from-left duration-300 flex flex-col h-full p-4">
                        <SidebarContent {...sidebarProps} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={cn(
                "flex-1 min-h-screen transition-all duration-500 pt-16 md:pt-0",
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
