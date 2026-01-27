import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Property } from '../../types';
import { Plus, Hotel, MapPin, Phone, Search, Trash2, AlertTriangle } from 'lucide-react';
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

export default function PropertiesList() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('name');

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProperty = (id: string) => {
        setPropertyToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!propertyToDelete) return;

        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyToDelete);

            if (error) throw error;

            setProperties(properties.filter(p => p.id !== propertyToDelete));
            setIsDeleteModalOpen(false);
            setPropertyToDelete(null);
        } catch (error: any) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property: ' + error.message);
        }
    };

    const filteredProperties = properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Properties</h1>
                    <p className="text-muted-foreground mt-1">Manage your hotel and accommodation partners.</p>
                </div>
                <Link to="/properties/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-7">
                    <CardTitle>All Properties</CardTitle>
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search properties..."
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
                                    <TableHead>Property Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProperties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No properties found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProperties.map((property) => (
                                        <TableRow key={property.id}>
                                            <TableCell>
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Hotel className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{property.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {property.location || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {property.contact_info.phone ? (
                                                    <div className="flex items-center text-muted-foreground">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {property.contact_info.phone}
                                                    </div>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link to={`/properties/${property.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => deleteProperty(property.id)}
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
                                <DialogTitle className="text-lg font-semibold text-foreground">Delete Property</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Are you sure you want to delete this property? This action cannot be undone and will permanently remove the data from our servers.
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
                            Delete Property
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
