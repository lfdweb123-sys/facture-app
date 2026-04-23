import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileCheck, Search, Plus, Eye, Trash2, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if(!user) return;
    (async()=>{
      try {
        const q = query(collection(db,'contracts'),where('userId','==',user.uid),orderBy('createdAt','desc'));
        const snap = await getDocs(q);
        setContracts(snap.docs.map(d=>({id:d.id,...d.data()})));
      } catch { toast.error('Erreur'); }
      finally { setLoading(false); }
    })();
  },[user]);

  const handleDelete = async(id) => {
    if(!confirm('Supprimer ?')) return;
    await deleteDoc(doc(db,'contracts',id));
    setContracts(p=>p.filter(c=>c.id!==id));
    toast.success('Supprimé');
  };

  const filtered = contracts.filter(c=>{
    const s = search.toLowerCase();
    const m = !s || (c.title||'').toLowerCase().includes(s) || (c.clientName||'').toLowerCase().includes(s);
    return statusFilter==='all' ? m : m && c.status===statusFilter;
  });

  const badge = (s) => {
    const b = { active:'bg-emerald-50 text-emerald-700', pending:'bg-amber-50 text-amber-700', completed:'bg-blue-50 text-blue-700', cancelled:'bg-red-50 text-red-700' };
    const l = { active:'Actif', pending:'En attente', completed:'Terminé', cancelled:'Annulé' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b[s]||'bg-gray-100 text-gray-600'}`}>{l[s]||'Brouillon'}</span>;
  };

  if(loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contrats</h1>
          <p className="text-xs text-gray-500">{contracts.length} contrat{contracts.length>1?'s':''}</p>
        </div>
        <Link to="/contracts/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5">
          <Plus size={16}/> Nouveau
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all','active','pending','completed','cancelled'].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter===s?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>
            {s==='all'?'Tous':badge({active:'Actif',pending:'En attente',completed:'Terminé',cancelled:'Annulé'}[s]||s)}
          </button>
        ))}
        <div className="flex-1"/>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-36 sm:w-48 focus:ring-1 focus:ring-gray-900 outline-none"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12}/></button>}
        </div>
      </div>

      {/* Liste */}
      {contracts.length===0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FileCheck size={40} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-900 font-medium mb-1">Aucun contrat</p>
          <p className="text-gray-500 text-sm mb-4">Créez votre premier contrat avec l'IA</p>
          <Link to="/contracts/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">+ Créer</Link>
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Aucun résultat</p>
          <button onClick={()=>{setSearch('');setStatusFilter('all')}} className="text-sm text-gray-900 underline mt-2">Effacer</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c=>(
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-gray-200 transition-all">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileCheck size={18} className="text-gray-500"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.title||'Sans titre'}</p>
                  {badge(c.status)}
                </div>
                <p className="text-xs text-gray-500 truncate">{c.clientName||'Client'}</p>
                <p className="text-xs text-gray-400">
                  {c.startDate ? format(new Date(c.startDate),'dd/MM/yy') : '—'} → {c.endDate ? format(new Date(c.endDate),'dd/MM/yy') : '—'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{(parseInt(c.amount)||0).toLocaleString()} XOF</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={()=>setSelected(c)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Eye size={16}/></button>
                <button onClick={()=>handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-3 border-b flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-sm">{selected.title||'Contrat'}</h3>
              <button onClick={()=>setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Client</p>
                  <p className="font-semibold text-gray-900">{selected.clientName}</p>
                  <p className="text-gray-500 text-xs">{selected.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase mb-1">Montant</p>
                  <p className="text-lg font-bold text-gray-900">{(parseInt(selected.amount)||0).toLocaleString()} XOF</p>
                  {badge(selected.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-3">
                <div><p className="text-xs text-gray-400">Début</p><p className="font-medium">{selected.startDate?format(new Date(selected.startDate),'dd/MM/yyyy'):'—'}</p></div>
                <div><p className="text-xs text-gray-400">Fin</p><p className="font-medium">{selected.endDate?format(new Date(selected.endDate),'dd/MM/yyyy'):'—'}</p></div>
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
                  <p className="text-gray-700">{selected.description}</p>
                </div>
              )}
              {selected.terms && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Termes</p>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{selected.terms}</div>
                </div>
              )}
              {/* Signature */}
              <div className="border-t pt-3 text-center text-xs text-gray-400">
                <p className="font-semibold text-gray-500">Facture App</p>
                <p>Contrat généré électroniquement</p>
                <p className="mt-1">Signé par : <span className="font-medium text-gray-600">{user?.displayName||user?.email}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}