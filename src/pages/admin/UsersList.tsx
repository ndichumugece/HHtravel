import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, User } from 'lucide-react';
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

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="text-sm text-gray-500">
                    To add users, invite them via Supabase Dashboard (or implement Invite API)
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <li key={user.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            <Mail className="h-3 w-3 mr-1" />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                    <div className="ml-4 text-sm text-gray-500">
                                        Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
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
