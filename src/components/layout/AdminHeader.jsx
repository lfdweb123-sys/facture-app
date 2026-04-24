import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Bell, User, LogOut, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white hidden sm:block">Administration</span>
        </Link>
        <span className="hidden sm:block h-5 w-px bg-gray-700"></span>
        <span className="text-xs text-gray-400 hidden sm:block">Facture App</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Retour au site
        </Link>

        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-gray-300">
              {user?.displayName?.split(' ')[0] || 'Admin'}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    <Shield size={10} /> Administrateur
                  </span>
                </div>
                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <ArrowLeft size={16} /> Retour au site
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}