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
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { 
    Users, 
    TrendingUp, 
    ArrowLeft, 
    Search,
    Filter,
    Download,
    Phone,
    User,
    Calendar,
    Activity,
    ChevronLeft,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function LeadsReport() {
    const [loading, setLoading] = useState(true);
    const [leadStats, setLeadStats] = useState<any[]>([]);
    const [allLeads, setAllLeads] = useState<any[]>([]);
    const [totalLeads, setTotalLeads] = useState(0);
    
    // Filtering & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchLeadsData();
    }, []);

    const fetchLeadsData = async () => {
        setLoading(true);
        try {
            // Fetch all bookings with lead source info
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('id, guest_name, guest_contact, lead_source, created_at, property_name, status')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setAllLeads(data);
                setTotalLeads(data.length);

                // Process Lead Sources
                const sourceCounts: Record<string, number> = {};
                data.forEach(item => {
                    const source = item.lead_source || 'Unknown';
                    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
                });

                const processedStats = Object.entries(sourceCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);
                
                setLeadStats(processedStats);
            }
        } catch (err) {
            console.error('Error fetching leads data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Derived Logic for Filtering and Pagination
    const uniqueSources = Array.from(new Set(allLeads.map(l => l.lead_source || 'Unknown'))).sort();
    const uniqueStatuses = Array.from(new Set(allLeads.map(l => l.status || 'Pending'))).sort();

    const filteredLeads = allLeads.filter(lead => {
        const matchesSearch = 
            lead.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            lead.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.lead_source?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSource = sourceFilter === 'All' || (lead.lead_source || 'Unknown') === sourceFilter;
        const matchesStatus = statusFilter === 'All' || (lead.status || 'Pending') === statusFilter;
        
        return matchesSearch && matchesSource && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / rowsPerPage));
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sourceFilter, statusFilter]);

    const handleExport = () => {
        if (!allLeads.length) return;

        const headers = ['Guest Name', 'Contact', 'Lead Source', 'Property', 'Date', 'Status'];
        const rows = allLeads.map(lead => [
            lead.guest_name,
            lead.guest_contact || '',
            lead.lead_source || 'Unknown',
            lead.property_name,
            format(new Date(lead.created_at), 'yyyy-MM-dd'),
            lead.status || 'Pending'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Leads Performance</h1>
                        <p className="text-muted-foreground mt-1">Detailed analysis of lead acquisition and sources.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-50 rounded-xl">
                            <Users className="w-5 h-5 text-brand-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Total Leads</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{totalLeads}</span>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">All Time</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Top Source</h3>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">{leadStats[0]?.name || 'N/A'}</span>
                        <p className="text-xs text-muted-foreground mt-1">Responsible for {((leadStats[0]?.value / totalLeads) * 100).toFixed(1)}% of leads</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Activity className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Active Campaign</h3>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">None</span>
                        <p className="text-xs text-muted-foreground mt-1">No active tracking campaigns</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-foreground">Source Distribution</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={leadStats} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {leadStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-foreground">Market Share %</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leadStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 pb-4">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground">Lead Performance List</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredLeads.length === allLeads.length 
                                    ? `Total of ${allLeads.length} leads acquired.` 
                                    : `Found ${filteredLeads.length} leads matching your filters.`}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border w-full md:w-64 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                                <Search className="w-4 h-4 text-muted-foreground ml-1" />
                                <input 
                                    type="text" 
                                    placeholder="Search leads..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 w-full"
                                />
                            </div>

                            {/* Source Filter */}
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border w-full md:w-auto">
                                <span className="text-xs font-bold text-muted-foreground uppercase ml-1">Source:</span>
                                <select 
                                    value={sourceFilter}
                                    onChange={(e) => setSourceFilter(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 font-medium py-0 h-auto"
                                >
                                    <option value="All">All Sources</option>
                                    {uniqueSources.map(source => (
                                        <option key={source} value={source}>{source}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border w-full md:w-auto">
                                <span className="text-xs font-bold text-muted-foreground uppercase ml-1">Status:</span>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 font-medium py-0 h-auto"
                                >
                                    <option value="All">All Statuses</option>
                                    {uniqueStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto px-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                <th className="pb-4 pt-2">Lead / Guest</th>
                                <th className="pb-4 pt-2 text-center">Source</th>
                                <th className="pb-4 pt-2">Property</th>
                                <th className="pb-4 pt-2">Date</th>
                                <th className="pb-4 pt-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                                                <User className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{lead.guest_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                {lead.guest_contact && (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3" />
                                                        {lead.guest_contact}
                                                    </span>
                                                )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center">
                                        <span className="px-3 py-1 bg-white text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-100 shadow-sm">
                                            {lead.lead_source || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-5">
                                        <p className="text-sm font-bold text-slate-700">{lead.property_name}</p>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2.5 text-sm text-slate-500 font-bold">
                                            <Calendar className="w-4 h-4 text-brand-400" />
                                            {format(new Date(lead.created_at), 'd MMM yyyy')}
                                        </div>
                                    </td>
                                    <td className="py-5 text-right">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                            lead.status === 'issued' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            lead.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            'bg-slate-50 text-slate-700 border-slate-100'
                                        }`}>
                                            {lead.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {paginatedLeads.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Activity className="w-12 h-12" />
                                            <p className="text-lg font-bold">No matching leads found</p>
                                            <p className="text-sm">Try adjusting your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-8 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                    <p className="text-sm font-bold text-muted-foreground order-2 md:order-1">
                        Showing <span className="text-foreground">{filteredLeads.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * rowsPerPage, filteredLeads.length)}</span> of <span className="text-foreground">{filteredLeads.length}</span> leads
                    </p>
                    
                    <div className="flex items-center gap-2 order-1 md:order-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 rounded-xl border bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                        currentPage === page 
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-110' 
                                            : 'bg-white border hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 rounded-xl border bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

