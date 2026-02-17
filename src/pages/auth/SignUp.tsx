import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Loader2 } from 'lucide-react';

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(!!token);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            validateToken(token);
        }
    }, [token]);

    const validateToken = async (inviteToken: string) => {
        try {
            const { data, error } = await supabase
                .from('user_invites')
                .select('email, role')
                .eq('token', inviteToken)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Invalid or expired invitation.');

            setEmail(data.email);
        } catch (err: any) {
            console.error('Error validating token:', err);
            setError(err.message || 'Invalid invitation link.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // 1. Sign up with Supabase Auth
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (authError) throw authError;

            // 2. If valid token, the handle_new_user trigger should handle role assignment
            // But we need to ensure the invite is claimed/deleted or marked as used.
            // Our previous handle_new_user trigger logic checks for email match in user_invites.
            // Since we pre-filled email from token, it should match.

            // Note: If email confirmation is enabled, they can't login yet.
            // If disabled, they are logged in.

            alert('Account created successfully! You can now log in.');
            navigate('/login');

        } catch (err: any) {
            console.error('Sign up error:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                    <CardDescription className="text-center">
                        {token ? 'Complete your registration to join.' : 'Enter your details to sign up.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => !token && setEmail(e.target.value)}
                                readOnly={!!token}
                                disabled={!!token}
                                className={token ? "bg-muted" : ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>

                        <div className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account? <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/login')}>Log in</span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
