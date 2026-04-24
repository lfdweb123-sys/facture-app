import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Search, Mail, Shield, Ban, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('Utilisateurs chargés:', allUsers.length); // Debug
        setUsers(allUsers);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        toast.error('Erreur de chargement. Vérifiez les règles Firestore.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        verificationStatus: status, 
        updatedAt: new Date().toISOString() 
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: status } : u));
      toast.success(status === 'approved' ? 'Utilisateur approuvé' : 'Utilisateur bloqué');
    } catch { toast.error('Erreur'); }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const match = !s || (u.displayName||'').toLowerCase().includes(s) || (u.email||'').toLowerCase().includes(s);
    if (filter === 'all') return match;
    return match && u.verificationStatus === filter;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Utilisateurs</h1><p className="text-xs text-gray-500">{users.length} utilisateurs</p></div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'approved', 'pending', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===s?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>
            {s==='all'?'Tous':s==='approved'?'Vérifiés':s==='pending'?'En attente':'Rejetés'}
          </button>
        ))}
        <div className="flex-1"/>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40 sm:w-56"/>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-4">Utilisateur</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Inscrit le</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {filtered.map(u => (
          <div key={u.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 items-center">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{u.displayName?.charAt(0)||u.email?.charAt(0)||'?'}</div>
              <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{u.displayName||'Sans nom'}</p><p className="text-xs text-gray-500 truncate">{u.email}</p></div>
            </div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                u.verificationStatus==='approved'?'bg-emerald-50 text-emerald-700':
                u.verificationStatus==='pending'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'
              }`}>{u.verificationStatus||'Non vérifié'}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-600">{u.subscription?.plan||'free'}</div>
            <div className="col-span-2 text-xs text-gray-500">{u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yy') : '—'}</div>
            <div className="col-span-2 flex justify-end gap-1">
              {u.verificationStatus !== 'approved' && (
                <button onClick={()=>handleUpdateStatus(u.id, 'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle size={14}/></button>
              )}
              {u.verificationStatus !== 'rejected' && (
                <button onClick={()=>handleUpdateStatus(u.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Ban size={14}/></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}