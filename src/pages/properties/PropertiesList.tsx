import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Property } from '../../types';
import { Plus, Hotel, MapPin, Phone, Search } from 'lucide-react';
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

export default function PropertiesList() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
