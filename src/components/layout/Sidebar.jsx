import { Link, useLocation } from 'react-router-dom';
import {
  Layout,
  FileText,
  FileCheck,
  User,
  Settings,
  Bot,
  DollarSign,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Layout,
      path: '/dashboard',
      color: 'text-orange-500'
    },
    {
      title: 'Factures',
      icon: FileText,
      path: '/invoices',
      color: 'text-blue-500'
    },
    {
      title: 'Contrats',
      icon: FileCheck,
      path: '/contracts',
      color: 'text-purple-500'
    },
    {
      title: 'Assistant IA',
      icon: Bot,
      path: '/ai-assistant',
      color: 'text-green-500'
    },
    {
      title: 'Paiements',
      icon: DollarSign,
      path: '/payments',
      color: 'text-yellow-500'
    },
    {
      title: 'Profil',
      icon: User,
      path: '/profile',
      color: 'text-pink-500'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-500'
    },
    {
      title: 'Aide',
      icon: HelpCircle,
      path: '/help',
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-screen sticky top-16 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all z-10"
      >
        {collapsed ? (
          <ChevronRight size={16} className="text-gray-600" />
        ) : (
          <ChevronLeft size={16} className="text-gray-600" />
        )}
      </button>

      <nav className="p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-50 to-blue-50 text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon
                size={20}
                className={`${item.color} transition-transform group-hover:scale-110`}
              />
              {!collapsed && (
                <span className={`text-sm font-medium ${
                  isActive ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {item.title}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-blue-600"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-orange-100 to-blue-100 rounded-xl p-4">
            <Sparkles size={20} className="text-orange-500 mb-2" />
            <p className="text-xs text-gray-700 font-medium mb-1">Version Pro</p>
            <p className="text-xs text-gray-600">Débloquez toutes les fonctionnalités</p>
            <button className="mt-2 w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:shadow-lg transition-all">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}