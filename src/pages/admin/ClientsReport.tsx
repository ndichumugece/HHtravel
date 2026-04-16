import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
} from 'recharts';
import { 
    Users, 
    ArrowLeft, 
    Search,
    Download,
    Phone,
    User,
    Calendar,
    Activity,
    ChevronLeft,
    ChevronRight,
    Award,
    DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subMonths } from 'date-fns';

export default function ClientsReport() {
    const [loading, setLoading] = useState(true);
    const [clientStats, setClientStats] = useState<any[]>([]);
    const [allClients, setAllClients] = useState<any[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    
    // Filtering & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchClientsData();
    }, []);

    const fetchClientsData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('guest_name, guest_contact, quotation_price, created_at, status')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Aggregate by guest_name
                const clientMap: Record<string, any> = {};
                let runningRevenue = 0;

                data.forEach(item => {
                    if (item.status === 'cancelled') return;
                    
                    const name = item.guest_name;
                    if (!name) return;

                    if (!clientMap[name]) {
                        clientMap[name] = {
                            id: name,
                            name: name,
                            contact: item.guest_contact,
                            bookings: 0,
                            revenue: 0,
                            lastBooking: item.created_at
                        };
                    }

                    clientMap[name].bookings += 1;
                    const price = Number(item.quotation_price) || 0;
                    clientMap[name].revenue += price;
                    runningRevenue += price;

                    if (new Date(item.created_at) > new Date(clientMap[name].lastBooking)) {
                        clientMap[name].lastBooking = item.created_at;
                    }
                });

                const processedStats = Object.values(clientMap)
                    .sort((a: any, b: any) => b.bookings - a.bookings);
                
                setAllClients(processedStats);
                setTotalRevenue(runningRevenue);
                setClientStats(processedStats.slice(0, 10)); // Top 10 for charts
            }
        } catch (err) {
            console.error('Error fetching clients data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = allClients.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.contact?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredClients.length / rowsPerPage));
    const paginatedClients = filteredClients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleExport = () => {
        if (!allClients.length) return;

        const headers = ['Client Name', 'Contact', 'Total Bookings', 'Total Revenue', 'Last Booking'];
        const rows = allClients.map(client => [
            client.name,
            client.contact || '',
            client.bookings,
            client.revenue,
            format(new Date(client.lastBooking), 'yyyy-MM-dd')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `clients_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#FFC730', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#8b5cf6'];

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/reports" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Top Clients</h1>
                        <p className="text-muted-foreground mt-1">Analysis of your most frequent and valuable guests.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-50 rounded-xl">
                            <Award className="w-5 h-5 text-brand-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Top Guest</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold uppercase truncate max-w-[200px]">{allClients[0]?.name || 'N/A'}</span>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                            {allClients[0]?.bookings || 0} Bookings
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Avg. Revenue / Client</h3>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">
                            KES {(totalRevenue / (allClients.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Based on {allClients.length} unique clients</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Activity className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Active Bookers</h3>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">
                            {allClients.filter(c => new Date(c.lastBooking) > subMonths(new Date(), 3)).length}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Clients who booked in the last 90 days</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-foreground">Top 10 Clients (by Bookings)</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clientStats} layout="vertical" margin={{ left: 60, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="bookings" radius={[0, 8, 8, 0]} barSize={20}>
                                    {clientStats.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-foreground">Top 10 Clients (by Revenue)</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...clientStats].sort((a,b) => b.revenue - a.revenue)} layout="vertical" margin={{ left: 60, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: any) => `KES ${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={20} fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 pb-4">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground">Loyal Client Directory</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Comprehensive list of all guests and their booking history.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border w-full md:w-64 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                                <Search className="w-4 h-4 text-muted-foreground ml-1" />
                                <input 
                                    type="text" 
                                    placeholder="Search clients..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto px-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                <th className="pb-4 pt-2">Client / Guest</th>
                                <th className="pb-4 pt-2 text-center">Total Bookings</th>
                                <th className="pb-4 pt-2">Total Revenue</th>
                                <th className="pb-4 pt-2">Last Booking</th>
                                <th className="pb-4 pt-2 text-right">Loyalty Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedClients.map((client) => (
                                <tr key={client.name} className="group hover:bg-slate-50/50 transition-all duration-200">
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                                                <User className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase">{client.name}</p>
                                                {client.contact && (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                        <Phone className="w-3 h-3" />
                                                        {client.contact}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center">
                                        <span className="px-3 py-1 bg-brand-50 text-brand-700 text-sm font-bold rounded-lg border border-brand-100 shadow-sm">
                                            {client.bookings}
                                        </span>
                                    </td>
                                    <td className="py-5">
                                        <p className="text-sm font-bold text-slate-700">KES {client.revenue.toLocaleString()}</p>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2.5 text-sm text-slate-500 font-bold">
                                            <Calendar className="w-4 h-4 text-brand-400" />
                                            {format(new Date(client.lastBooking), 'd MMM yyyy')}
                                        </div>
                                    </td>
                                    <td className="py-5 text-right">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                            client.bookings >= 5 ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                            client.bookings >= 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-slate-50 text-slate-700 border-slate-100'
                                        }`}>
                                            {client.bookings >= 5 ? 'Platinum' : client.bookings >= 3 ? 'Frequent' : 'Regular'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {paginatedClients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Users className="w-12 h-12" />
                                            <p className="text-lg font-bold">No clients found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30 font-bold">
                    <p className="text-sm text-muted-foreground order-2 md:order-1">
                        Showing <span className="text-foreground">{filteredClients.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * rowsPerPage, filteredClients.length)}</span> of <span className="text-foreground">{filteredClients.length}</span> clients
                    </p>
                    <div className="flex items-center gap-2 order-1 md:order-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                            disabled={currentPage === 1} 
                            className="p-2.5 bg-white border rounded-xl disabled:opacity-50 transition-all hover:bg-slate-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                            disabled={currentPage === totalPages} 
                            className="p-2.5 bg-white border rounded-xl disabled:opacity-50 transition-all hover:bg-slate-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
