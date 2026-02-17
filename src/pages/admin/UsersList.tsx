import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { Profile } from '../../types';

export default function UsersList() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredUsers(users.filter(user =>
                (user.full_name?.toLowerCase() || '').includes(lowerQuery) ||
                (user.email?.toLowerCase() || '').includes(lowerQuery)
            ));
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as Profile[] || []);
            setFilteredUsers(data as Profile[] || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">Manage your team members and their permissions.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => navigate('/users/new')} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" /> Add User
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="hidden sm:flex">
                        <Filter className="h-4 w-4 mr-2" /> Filters
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 font-medium">User Name</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium">Last Active</th>
                                <th className="px-6 py-3 font-medium">Date Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => navigate(`/users/${user.id}`)}
                                    className="bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    className="h-10 w-10 rounded-full object-cover border"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-foreground">{user.full_name || 'No Name'}</div>
                                                <div className="text-muted-foreground text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {user.last_active
                                            ? format(new Date(user.last_active), 'MMM d, yyyy')
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
