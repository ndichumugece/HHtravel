import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'consultant')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return <Outlet />;
}
