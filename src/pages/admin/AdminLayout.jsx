import { Link, useLocation, Outlet } from 'react-router-dom';
import { Layout, Users, Shield, FileText, Settings, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: Layout, path: '/admin' },
    { title: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { title: 'Vérifications', icon: Shield, path: '/admin/verifications' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white"/>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Facture App</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={18}/> {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={16}/> Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden p-4 bg-red-600 text-white text-sm">📱 Menu admin disponible sur desktop</div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}