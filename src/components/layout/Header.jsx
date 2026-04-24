import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Recherche sans orderBy pour éviter l'erreur d'index
  useEffect(() => {
    if (!searchQuery.trim() || !user) { setSearchResults([]); return; }
    
    const searchData = async () => {
      setSearchLoading(true);
      const q = searchQuery.toLowerCase();
      try {
        const [invSnap, conSnap] = await Promise.all([
          getDocs(query(collection(db, 'invoices'), where('userId', '==', user.uid), limit(20))),
          getDocs(query(collection(db, 'contracts'), where('userId', '==', user.uid), limit(20)))
        ]);

        const invoices = invSnap.docs
          .map(d => ({ id: d.id, type: 'invoice', ...d.data() }))
          .filter(inv => 
            (inv.clientName || '').toLowerCase().includes(q) ||
            (inv.invoiceNumber || '').toLowerCase().includes(q)
          );

        const contracts = conSnap.docs
          .map(d => ({ id: d.id, type: 'contract', ...d.data() }))
          .filter(c => 
            (c.clientName || '').toLowerCase().includes(q) ||
            (c.title || '').toLowerCase().includes(q)
          );

        setSearchResults([...invoices, ...contracts].slice(0, 8));
      } catch (e) {
        console.error('Erreur recherche:', e);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user]);

  // Charger les notifications
  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'invoices'), where('userId', '==', user.uid), limit(10))
        );
        const notifs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(inv => inv.status === 'paid')
          .sort((a, b) => new Date(b.paymentDate || b.updatedAt || b.createdAt) - new Date(a.paymentDate || a.updatedAt || a.createdAt))
          .map(inv => ({
            id: inv.id,
            title: 'Paiement reçu',
            message: `${parseFloat(inv.total || 0).toLocaleString()} XOF de ${inv.clientName}`,
            time: inv.paymentDate || inv.updatedAt || inv.createdAt,
            read: false,
            link: `/invoices`
          }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      } catch (e) { console.error('Erreur notifs:', e); }
    };
    loadNotifications();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleSearchSelect = (item) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(item.type === 'invoice' ? '/invoices' : '/contracts');
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <header className="h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">FA</span>
          </div>
          <span className="text-sm font-semibold text-white hidden sm:block">Facture App</span>
        </Link>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* RECHERCHE */}
        <div ref={searchRef} className="relative">
          <button 
            onClick={() => { setSearchOpen(!searchOpen); setNotifOpen(false); }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Search size={18} />
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une facture, un contrat, un client..."
                    className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {searchQuery.trim() === '' ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    Tapez le nom d'un client ou un numéro de facture...
                  </div>
                ) : searchLoading ? (
                  <div className="p-4 flex justify-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    Aucun résultat pour "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left border-b border-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'invoice' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                        <span className={`text-xs font-bold ${item.type === 'invoice' ? 'text-blue-600' : 'text-purple-600'}`}>
                          {item.type === 'invoice' ? '📄' : '📋'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {item.type === 'invoice' ? item.invoiceNumber : (item.title || 'Sans titre')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.clientName || 'Client'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-900">
                          {item.type === 'invoice' 
                            ? `${parseFloat(item.total || 0).toLocaleString()} XOF`
                            : `${parseInt(item.amount || 0).toLocaleString()} XOF`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.type === 'invoice' ? 'Facture' : 'Contrat'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                  <span className="text-xs text-gray-500">{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setSearchOpen(false); }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => { 
                      setNotifications(prev => prev.map(n => ({...n, read: true}))); 
                      setUnreadCount(0); 
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Aucune notification</p>
                    <p className="text-xs text-gray-400 mt-1">Les paiements reçus apparaîtront ici</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => {
                        setNotifOpen(false);
                        setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                        setUnreadCount(prev => Math.max(0, prev - 1));
                      }}
                      className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">💰</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(notif.time)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER */}
        <div className="relative">
          <button 
            onClick={() => { setDropdownOpen(!dropdownOpen); setSearchOpen(false); setNotifOpen(false); }} 
            className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span className="hidden sm:block text-sm text-gray-300">
              {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}
            </span>
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