import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { BookingVoucher } from '../../types';
import { Plus, Calendar, Search, FileText, Trash2, AlertTriangle } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/Dialog';

export default function BookingList() {
    const [vouchers, setVouchers] = useState<BookingVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    const deleteVoucher = (id: string) => {
        setVoucherToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!voucherToDelete) return;

        try {
            const { error } = await supabase
                .from('booking_vouchers')
                .delete()
                .eq('id', voucherToDelete);

            if (error) throw error;

            setVouchers(vouchers.filter(v => v.id !== voucherToDelete));
            setIsDeleteModalOpen(false);
            setVoucherToDelete(null);
        } catch (error: any) {
            console.error('Error deleting voucher:', error);
            alert('Failed to delete voucher: ' + error.message);
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
                                    <TableHead className="text-right">Actions</TableHead>
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
                                        <TableRow key={voucher.id}>
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
                                            <TableCell className="text-right">
                                                <Link to={`/bookings/${voucher.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => deleteVoucher(voucher.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center gap-4 text-center sm:text-left sm:flex-row sm:items-start p-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <DialogHeader className="text-center sm:text-left">
                                <DialogTitle className="text-lg font-semibold text-foreground">Delete Booking Voucher</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Are you sure you want to delete this booking voucher? This action cannot be undone and will permanently remove the data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4 px-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
                        >
                            Delete Voucher
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
