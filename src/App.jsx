import { Link, useLocation } from 'react-router-dom';
import { Layout, Users, Shield, DollarSign, ArrowLeft, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { title: 'Dashboard', icon: Layout, path: '/admin' },
    { title: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { title: 'Vérifications', icon: Shield, path: '/admin/verifications' },
    { title: 'Retraits', icon: DollarSign, path: '/admin/payouts' }
  ];

  return (
    <>
      <header className="h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-40 lg:pl-6">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block">Administration</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white hidden sm:flex items-center gap-1">
            <ArrowLeft size={14} /> Retour au site
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.displayName?.charAt(0) || 'A'}</span>
            </div>
            <span className="hidden sm:block text-sm text-gray-300">{user?.displayName?.split(' ')[0] || 'Admin'}</span>
          </div>
        </div>
      </header>

      <aside className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-gray-900 text-white z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {!collapsed && <p className="px-3 text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu admin</p>}
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'} ${collapsed ? 'justify-center' : ''}`}>
                <Icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
            <ArrowLeft size={16} />
            {!collapsed && <span>Retour au site</span>}
          </Link>
          {!collapsed && (
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all w-full mt-1">
              <LogOut size={18} /> Déconnexion
            </button>
          )}
        </div>
      </aside>
    </>
  );
}