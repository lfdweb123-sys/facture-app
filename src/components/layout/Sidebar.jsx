import { Link, useLocation } from 'react-router-dom';
import { Layout, FileText, FileCheck, Bot, User, Settings, Wallet, Shield, ChevronLeft, ChevronRight, LogOut, Crown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isVerified = user?.verificationStatus === 'approved';
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { title: 'Dashboard', icon: Layout, path: '/dashboard', requireVerification: false },
    { title: 'Factures', icon: FileText, path: '/invoices', requireVerification: true },
    { title: 'Contrats', icon: FileCheck, path: '/contracts', requireVerification: true },
    { title: 'Portefeuille', icon: Wallet, path: '/wallet', requireVerification: true },
    { title: 'Assistant IA', icon: Bot, path: '/ai-assistant', requireVerification: true },
    { title: 'Abonnement', icon: Crown, path: '/subscription', requireVerification: false },
    { title: 'Profil', icon: User, path: '/profile', requireVerification: false },
    { title: 'Paramètres', icon: Settings, path: '/settings', requireVerification: false }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Menu principal */}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.requireVerification && !isVerified;
            const Icon = item.icon;

            if (isDisabled) {
              return (
                <div key={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all opacity-40 cursor-not-allowed select-none ${collapsed ? 'justify-center' : ''}`}>
                  <Icon size={20} className="text-gray-400" />
                  {!collapsed && <span className="text-gray-400">{item.title}</span>}
                  {!collapsed && <span className="ml-auto text-xs text-gray-400">🔒</span>}
                </div>
              );
            }

            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} ${collapsed ? 'justify-center' : ''}`}>
                <Icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
          
          {/* Vérification - visible si non vérifié */}
          {!isVerified && (
            <Link to="/verification" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/verification' ? 'bg-amber-50 text-amber-900' : 'text-amber-600 hover:bg-amber-50'} ${collapsed ? 'justify-center' : ''}`}>
              <Shield size={20} />
              {!collapsed && <span>Vérification</span>}
              {!collapsed && user?.verificationStatus === 'pending' && <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>}
            </Link>
          )}

          {/* Menu Admin - visible uniquement pour les admins */}
          {isAdmin && (
            <>
              <div className="pt-3 mt-3 border-t border-gray-100">
                {!collapsed && <p className="px-3 text-xs text-gray-400 uppercase tracking-wider mb-2">Administration</p>}
              </div>
              <Link to="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/admin' || location.pathname.startsWith('/admin/') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} ${collapsed ? 'justify-center' : ''}`}>
                <Shield size={20} className={location.pathname === '/admin' || location.pathname.startsWith('/admin/') ? 'text-red-600' : 'text-gray-500'} />
                {!collapsed && <span>Administration</span>}
              </Link>
            </>
          )}
        </nav>
        
        {!collapsed && (
          <div className="p-3 border-t border-gray-100">
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all w-full">
              <LogOut size={20} /> Déconnexion
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around h-16">
          {menuItems.slice(0,5).map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.requireVerification && !isVerified;
            const Icon = item.icon;

            if (isDisabled) {
              return (
                <div key={item.path} className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium text-gray-300 opacity-40 cursor-not-allowed">
                  <Icon size={20} />
                  <span className="truncate max-w-[60px]">{item.title}</span>
                </div>
              );
            }

            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                <Icon size={20} />
                <span className="truncate max-w-[60px]">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}