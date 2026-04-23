import { Link, useLocation } from 'react-router-dom';
import {
  Layout,
  FileText,
  FileCheck,
  Bot,
  User,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: Layout, path: '/dashboard' },
    { title: 'Factures', icon: FileText, path: '/invoices' },
    { title: 'Contrats', icon: FileCheck, path: '/contracts' },
    { title: 'Assistant IA', icon: Bot, path: '/ai-assistant' },
    { title: 'Paiements', icon: CreditCard, path: '/invoices' },
    { title: 'Profil', icon: User, path: '/profile' },
    { title: 'Paramètres', icon: Settings, path: '/settings' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden">
        {/* Mobile sidebar trigger - handled by Header or separate button */}
      </div>

      {/* Desktop Sidebar - Fixed */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-gray-100">
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all w-full"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around h-16">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-all ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}