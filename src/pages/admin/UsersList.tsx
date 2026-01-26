import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'consultant';
    created_at: string;
}

export default function UsersList() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // In real app, we might need to use RPC or management API to get auth users
            // Here we rely on the 'profiles' table which mirrors auth.users
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as Profile[] || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(userId);
        try {
            const { error } = await supabase.rpc('delete_user_by_id', { user_id: userId });
            if (error) throw error;

            // Optimistic update or refetch
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'consultant') => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <li key={user.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4 truncate">
                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            <Mail className="h-3 w-3 mr-1" />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                    <div className="text-sm text-gray-500 hidden sm:block">
                                        Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                                    </div>

                                    <div className="flex items-center border-l pl-4 ml-4 space-x-2">
                                        {user.role === 'consultant' ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                disabled={actionLoading === user.id}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
                                                title="Upgrade to Admin"
                                            >
                                                Upgrade
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'consultant')}
                                                disabled={actionLoading === user.id}
                                                className="text-amber-600 hover:text-amber-900 text-sm font-medium disabled:opacity-50"
                                                title="Downgrade to Consultant"
                                            >
                                                Downgrade
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={actionLoading === user.id}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
