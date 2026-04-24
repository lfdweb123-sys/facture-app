import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('⛔ AdminRoute - Non connecté');
    return <Navigate to="/login" replace />;
  }

  console.log('👮 AdminRoute - Vérification:', { email: user.email, role: user.role });

  if (user.role !== 'admin') {
    console.log('⛔ AdminRoute - Accès refusé (rôle:', user.role, ')');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AdminRoute - Accès autorisé');
  return children;
}