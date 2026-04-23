import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">FA</span>
          </div>
          <span className="text-sm font-semibold text-white hidden sm:block">Facture App</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Search size={18} />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span className="hidden sm:block text-sm text-gray-300">{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</span>
            <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={16} /> Profil
                </Link>
                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings size={16} /> Paramètres
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