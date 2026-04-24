export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // DEBUG : afficher le rôle dans la console
  console.log('AdminRoute - user:', user.email, 'role:', user.role);

  if (!user.role || user.role !== 'admin') {
    console.log('Accès admin refusé - rôle manquant ou incorrect');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}