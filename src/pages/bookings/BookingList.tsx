import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { BookingVoucher } from '../../types';
import { Plus, Calendar, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';


export default function BookingList() {
    const [vouchers, setVouchers] = useState<BookingVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('*, profiles:consultant_id(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVouchers(data || []);
        } catch (error: any) {
            console.error('Error fetching vouchers:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredVouchers = vouchers.filter(voucher =>
        voucher.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.property_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
            <p className="font-bold">Error loading vouchers</p>
            <p className="text-sm">{error}</p>
            <Button onClick={fetchVouchers} variant="outline" className="mt-4">Retry</Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Booking Vouchers</h1>
                    <p className="text-muted-foreground mt-1">Manage all your confirmed booking vouchers.</p>
                </div>
                <Link to="/bookings/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Voucher
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-7">
                    <CardTitle>Vouchers</CardTitle>
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vouchers..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Guest & Property</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVouchers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No booking vouchers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVouchers.map((voucher) => (
                                        <TableRow
                                            key={voucher.id}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => navigate(`/bookings/${voucher.id}/edit`)}
                                        >
                                            <TableCell>
                                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium font-mono text-xs">
                                                {voucher.reference_number}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {(Array.isArray(voucher.profiles) ? voucher.profiles[0]?.full_name : voucher.profiles?.full_name) || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{voucher.guest_name}</span>
                                                    <span className="text-xs text-muted-foreground">{voucher.property_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {format(new Date(voucher.check_in_date), 'MMM d, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${voucher.status === 'issued'
                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                    : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                    }`}>
                                                    {voucher.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
