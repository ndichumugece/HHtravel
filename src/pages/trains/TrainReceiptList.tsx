import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { TrainReceipt } from '../../types';
import { Plus, Search, ChevronLeft, ChevronRight, TrainFront, Calendar } from 'lucide-react';
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
import { useAuth } from '../../context/AuthContext';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/Dialog";

export default function TrainReceiptList() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState<TrainReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showOnlyMine, setShowOnlyMine] = useState(false);
    const itemsPerPage = 15;
    const { user } = useAuth();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const { data, error } = await supabase
                .from('train_receipts')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReceipts(data || []);
        } catch (error) {
            console.error('Error fetching train receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            const { error } = await supabase
                .from('train_receipts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            setReceipts(prev => prev.filter(r => r.id !== id));
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting train receipt:', error);
            alert('Failed to delete receipt');
        } finally {
            setDeleting(false);
        }
    };

    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch = 
            receipt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesMine = !showOnlyMine || receipt.consultant_id === user?.id;
        
        return matchesSearch && matchesMine;
    });

    const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
    const currentReceipts = filteredReceipts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <TrainFront className="h-8 w-8 text-brand-600" />
                        Train Tickets
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage all generated train travel tickets.</p>
                </div>
                <Link to="/trains/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-7">
                    <CardTitle>All Tickets</CardTitle>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <Switch 
                                id="show-mine-receipts" 
                                checked={showOnlyMine}
                                onCheckedChange={setShowOnlyMine}
                            />
                            <Label htmlFor="show-mine-receipts" className="text-sm font-medium cursor-pointer">My Tickets</Label>
                        </div>
                        <div className="w-full sm:w-64">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tickets..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Journey</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReceipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No tickets found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentReceipts.map((receipt) => (
                                        <TableRow
                                            key={receipt.id}
                                            className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => navigate(`/trains/${receipt.id}/edit`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm">{receipt.reference_number}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        By {Array.isArray(receipt.profiles) ? receipt.profiles[0]?.full_name : receipt.profiles?.full_name || 'System'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{receipt.client_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {receipt.guests?.length || 0} Guest{receipt.guests?.length !== 1 ? 's' : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{receipt.train_type}</div>
                                                <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                    {receipt.from_station} → {receipt.to_station}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(receipt.departure_date), 'MMM d, yyyy')}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {receipt.departure_time}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8 p-0"
                                                    onClick={() => setDeleteId(receipt.id)}
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
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReceipts.length)} of {filteredReceipts.length} entries
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <AlertTriangle className="h-6 w-6" />
                            <DialogTitle>Delete Ticket</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to delete this train ticket? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Ticket'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
