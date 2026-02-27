import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    role: 'admin' | 'consultant' | null;
    profile: { full_name: string } | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    role: null,
    profile: null,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'consultant' | null>(null);
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
                updateLastActive(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateLastActive = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ last_active: new Date().toISOString() })
                .eq('id', userId);

            if (error) {
                // Check if it's a 400 error which likely means missing column
                if (error.code === '42703' || (error as any).status === 400) {
                    console.warn(`Profile update failed for user ${userId}: Column last_active might be missing. Please run fix_profiles_schema_consolidated.sql`);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error updating last_active:', error);
        }
    };

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setRole(data?.role as 'admin' | 'consultant' | null);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching user role:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, role, profile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
