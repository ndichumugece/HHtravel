import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { QuotationVoucher } from '../../types';
import { Plus, Calendar, Search, FileBadge } from 'lucide-react';
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

export default function QuotationList() {
    const [quotations, setQuotations] = useState<QuotationVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const { data, error } = await supabase
                .from('quotation_vouchers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotations(data || []);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter(quote =>
        quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.reference_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Quotations</h1>
                    <p className="text-muted-foreground mt-1">Manage all client travel quotations.</p>
                </div>
                <Link to="/quotations/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quotation
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-7">
                    <CardTitle>Quotations</CardTitle>
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search quotations..."
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
                                    <TableHead>Client</TableHead>
                                    <TableHead>Package Info</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuotations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No quotations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredQuotations.map((quote) => (
                                        <TableRow key={quote.id}>
                                            <TableCell>
                                                <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <FileBadge className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium font-mono text-xs">
                                                {quote.reference_number}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {quote.client_name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{quote.package_type}</span>
                                                    {quote.check_in_date && (
                                                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {format(new Date(quote.check_in_date), 'MMM d, yyyy')}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${quote.booking_status === 'Confirmed'
                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                    : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                    }`}>
                                                    {quote.booking_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link to={`/quotations/${quote.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
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
