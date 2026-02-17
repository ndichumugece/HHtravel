
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { ArrowLeft, Loader2, Save, Upload, User as UserIcon } from 'lucide-react';
import type { Profile } from '../../types';

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id && id !== 'new');

    // State
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Partial<Profile>>({
        role: 'consultant',
        full_name: '',
        email: '',
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchProfile(id);
        }
    }, [id]);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data as Profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Failed to load user profile');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const [inviteLink, setInviteLink] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditMode) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: profile.full_name,
                        role: profile.role,
                        avatar_url: profile.avatar_url,
                        color: profile.color,
                    })
                    .eq('id', id);

                if (error) throw error;
                navigate('/users');
            } else {
                // Create Invitation
                const { data, error } = await supabase
                    .from('user_invites')
                    .insert({
                        email: profile.email,
                        role: profile.role,
                        invited_by: (await supabase.auth.getUser()).data.user?.id
                    })
                    .select('token')
                    .single();

                if (error) throw error;

                const token = data.token;
                const link = `${window.location.origin}/signup?token=${token}`;
                setInviteLink(link);
            }
        } catch (error: any) {
            console.error('Error saving user/invite:', error);
            alert('Failed: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSaving(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('company_assets') // Reusing existing bucket or create 'avatars' bucket
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company_assets')
                .getPublicUrl(fileName);

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setSaving(true);
        try {
            const { error } = await supabase.rpc('delete_user_by_id', { user_id: id });
            if (error) throw error;

            navigate('/users');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user: ' + error.message);
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/users')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
            </Button>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Manage user details and permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {inviteLink ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-4">
                            <h3 className="text-lg font-medium text-green-800">Invitation Created!</h3>
                            <p className="text-green-600">Share this link with the new user to let them sign up.</p>

                            <div className="flex items-center gap-2">
                                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(inviteLink);
                                        alert('Copied to clipboard!');
                                    }}
                                    variant="outline"
                                >
                                    Copy
                                </Button>
                            </div>

                            <Button onClick={() => setInviteLink(null)} variant="ghost" className="text-sm">
                                Create Another
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0 flex justify-center md:justify-start">
                                    <div className="relative group cursor-pointer">
                                        <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                                    <UserIcon className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="h-8 w-8 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleAvatarUpload}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                                        <Input
                                            value={profile.full_name || ''}
                                            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                            placeholder="Jane Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Email Address</label>
                                        <Input
                                            value={profile.email || ''}
                                            readOnly={isEditMode}
                                            disabled={isEditMode}
                                            className={isEditMode ? "bg-muted" : ""}
                                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="jane@example.com"
                                        />
                                        {isEditMode && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly.</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Role</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={profile.role}
                                            onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value as 'admin' | 'consultant' }))}
                                        >
                                            <option value="consultant">Consultant</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Profile Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={profile.color || '#cccccc'}
                                                onChange={(e) => setProfile(prev => ({ ...prev, color: e.target.value }))}
                                                className="h-10 w-20 cursor-pointer rounded-md border border-input p-1"
                                            />
                                            <span className="text-sm text-muted-foreground">{profile.color || 'No color selected'}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Used for identifying users in the calendar.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                {isEditMode ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={saving}
                                    >
                                        Delete User
                                    </Button>
                                ) : (
                                    <div></div> // Spacer
                                )}

                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" />
                                    {isEditMode ? 'Save Changes' : 'Create Invitation Link'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
