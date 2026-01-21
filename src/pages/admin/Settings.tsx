import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { CompanySettings, Profile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Loader2, Save, User, Trash2, Plus, Copy, Check } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'team' | 'branding'>('team');
    const [loading, setLoading] = useState(false);

    // Team State
    const [users, setUsers] = useState<Profile[]>([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin' | 'consultant'>('consultant');
    const [newUserLoading, setNewUserLoading] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]); // Assuming a type for pending invites
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Branding State
    const [settings, setSettings] = useState<Partial<CompanySettings>>({});

    useEffect(() => {
        fetchUsers();
        fetchPendingInvites();
    }, []);

    useEffect(() => {
        if (activeTab === 'team') {
            fetchUsers();
            fetchPendingInvites();
        } else {
            fetchSettings();
        }
    }, [activeTab]);

    // --- Team Functions ---
    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setUsers(data as Profile[] || []);
        setLoading(false);
    };

    const fetchPendingInvites = async () => {
        const { data } = await supabase.from('user_invites').select('*').order('created_at', { ascending: false });
        setPendingInvites(data || []);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setNewUserLoading(true);

        try {
            // 1. Create or Update pending invite record (Upsert)
            const { error: dbError } = await supabase
                .from('user_invites')
                .upsert({
                    email: newUserEmail,
                    role: newUserRole
                }, { onConflict: 'email' });

            if (dbError) throw dbError;

            // 2. Generate Invite Link (No email sent)
            const link = `${window.location.origin}/login?signup=true&email=${encodeURIComponent(newUserEmail)}`;

            setInviteLink(link);
            setNewUserEmail('');
            fetchPendingInvites();

        } catch (error: any) {
            console.error('Error creating invite:', error);
            alert(error.message || 'Failed to create invite.');
        } finally {
            setNewUserLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code', err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('WARNING: This will permanently delete the user account and all associated data. This action cannot be undone. Are you sure?')) return;

        try {
            const { error } = await supabase.rpc('delete_user_by_id', { user_id: userId });

            if (error) throw error;

            alert('User account deleted successfully.');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(error.message || 'Failed to delete user.');
        }
    };

    // --- Branding Functions ---
    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) {
            setSettings(data);
        }
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // Check if exists
            const { data: existing } = await supabase.from('company_settings').select('id').single();

            if (existing) {
                const { error } = await supabase.from('company_settings').update(settings).eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('company_settings').insert(settings);
                if (error) throw error;
            }
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your team and company branding.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'team'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Team Members
                </button>
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'branding'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Branding & PDF
                </button>
            </div>

            {activeTab === 'team' && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Management</CardTitle>
                            <CardDescription>View and manage consultants and administrators.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddUser} className="grid gap-4 md:grid-cols-3 items-end">
                                <div>
                                    <label className="text-sm font-medium leading-none">Name (Optional)</label>
                                    <Input
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="e.g. David"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Invite New User (Email)</label>
                                    <Input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="colleague@hhtravel.com"
                                        className="mt-2"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium leading-none">Role</label>
                                        <select
                                            value={newUserRole}
                                            onChange={(e) => setNewUserRole(e.target.value as any)}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                        >
                                            <option value="consultant">Consultant</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Button type="submit" disabled={newUserLoading} className="mb-[1px]">
                                        {newUserLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {!newUserLoading && <Plus className="h-4 w-4 mr-2" />}
                                        Generate Link
                                    </Button>
                                </div>
                            </form>

                            {/* Pending Invites Table */}
                            {pendingInvites.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Pending Invites</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pendingInvites.map((invite) => (
                                                    <TableRow key={invite.id}>
                                                        <TableCell>{invite.email}</TableCell>
                                                        <TableCell className="capitalize">{invite.role}</TableCell>
                                                        <TableCell>{new Date(invite.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const link = `${window.location.origin}/login?signup=true&email=${encodeURIComponent(invite.email)}`;
                                                                    setInviteLink(link);
                                                                    copyToClipboard(link);
                                                                }}
                                                            >
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                Copy Link
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                                                            {user.full_name?.[0] || <User className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.full_name || 'No Name'}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'branding' && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>These details will appear on your generated PDFs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Company Name</label>
                                    <Input
                                        value={settings.company_name || ''}
                                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                        placeholder="H&H Travel"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Website</label>
                                    <Input
                                        value={settings.company_website || ''}
                                        onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                                        placeholder="www.hhtravel.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                                    <Input
                                        value={settings.company_email || ''}
                                        onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                        placeholder="bookings@hhtravel.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Logo Image</label>
                                    <div className="flex items-center gap-4">
                                        {settings.logo_url && (
                                            <img
                                                src={settings.logo_url}
                                                alt="Company Logo"
                                                className="h-12 w-12 object-contain border rounded p-1 bg-white"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        setLoading(true);
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `logo-${Date.now()}.${fileExt}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('company_assets')
                                                            .upload(fileName, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('company_assets')
                                                            .getPublicUrl(fileName);

                                                        setSettings({ ...settings, logo_url: publicUrl });
                                                    } catch (error) {
                                                        console.error('Error uploading logo:', error);
                                                        alert('Failed to upload logo. Ensure "company_assets" bucket exists.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Upload a PNG or JPG (Max 2MB).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Company Address</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={settings.company_address || ''}
                                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                                    placeholder="123 Safari Way..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>PDF Appearance</CardTitle>
                            <CardDescription>Customize the footer and legal text on your documents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Footer Text</label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={settings.pdf_footer_text || ''}
                                    onChange={(e) => setSettings({ ...settings, pdf_footer_text: e.target.value })}
                                    placeholder="Thank you for traveling with us."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveSettings} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            )}
            {/* Invite Link Modal */}
            {inviteLink && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-2">Invite Link Generated</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Share this secure link with the new team member properly.
                        </p>

                        <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md border border-input mb-6">
                            <input
                                readOnly
                                value={inviteLink}
                                className="flex-1 bg-transparent text-sm outline-none text-muted-foreground truncate"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(inviteLink)}
                                className={copied ? "text-green-600" : ""}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setInviteLink(null)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
