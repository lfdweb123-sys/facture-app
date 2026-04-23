import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus,
  Eye,
  Download,
  Trash2,
  Calendar,
  X,
  Link2,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateInvoicePDF } from '../services/pdf';
import toast from 'react-hot-toast';

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewInvoice, setPreviewInvoice] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchInvoices = async () => {
      try {
        const q = query(collection(db, 'invoices'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { toast.error('Erreur chargement'); }
      finally { setLoading(false); }
    };
    fetchInvoices();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    await deleteDoc(doc(db, 'invoices', id));
    setInvoices(p => p.filter(i => i.id !== id));
    toast.success('Supprimée');
  };

  const handleCopyLink = (inv) => {
    navigator.clipboard.writeText(`${window.location.origin}/pay?invoice=${inv.id}`);
    toast.success('Lien copié !');
  };

  const handleDownload = (inv) => {
    try { generateInvoicePDF(inv).save(`facture_${inv.invoiceNumber}.pdf`); }
    catch { toast.error('Erreur PDF'); }
  };

  const filtered = invoices.filter(inv => {
    const s = search.toLowerCase();
    const match = !s || (inv.clientName||'').toLowerCase().includes(s) || (inv.invoiceNumber||'').toLowerCase().includes(s);
    return statusFilter === 'all' ? match : match && inv.status === statusFilter;
  });

  const statusBtn = (s, l) => (
    <button onClick={() => setStatusFilter(s)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
      {l}
    </button>
  );

  const statusBadge = (s) => {
    const m = { paid:'bg-emerald-50 text-emerald-700', pending:'bg-amber-50 text-amber-700', overdue:'bg-red-50 text-red-700' };
    const l = { paid:'Payée', pending:'En attente', overdue:'En retard' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m[s]||'bg-gray-100 text-gray-600'}`}>{l[s]||'Brouillon'}</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-xs text-gray-500 mt-0.5">{invoices.length} facture{invoices.length>1?'s':''}</p>
        </div>
        <Link to="/invoices/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5">
          <Plus size={16}/> Nouvelle
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusBtn('all','Toutes')}
        {statusBtn('pending','En attente')}
        {statusBtn('paid','Payées')}
        {statusBtn('overdue','En retard')}
        <div className="flex-1"/>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-36 sm:w-48 focus:ring-1 focus:ring-gray-900 outline-none"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12}/></button>}
        </div>
      </div>

      {/* Liste */}
      {invoices.length===0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FileText size={40} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-900 font-medium mb-1">Aucune facture</p>
          <p className="text-gray-500 text-sm mb-4">Créez votre première facture</p>
          <Link to="/invoices/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">+ Créer</Link>
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Aucun résultat</p>
          <button onClick={()=>{setSearch('');setStatusFilter('all')}} className="text-sm text-gray-900 underline mt-2">Effacer</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <div key={inv.id} className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-gray-200 transition-all">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-gray-500"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{inv.invoiceNumber}</p>
                  {statusBadge(inv.status)}
                </div>
                <p className="text-xs text-gray-500 truncate">{inv.clientName}</p>
                <p className="text-xs text-gray-400">{inv.date ? format(new Date(inv.date), 'dd/MM/yy') : '—'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{parseFloat(inv.total||0).toLocaleString()} XOF</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={()=>setPreviewInvoice(inv)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Aperçu"><Eye size={16}/></button>
                <button onClick={()=>handleDownload(inv)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="PDF"><Download size={16}/></button>
                {inv.status!=='paid' && <button onClick={()=>handleCopyLink(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Lien paiement"><Link2 size={16}/></button>}
                <button onClick={()=>handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Aperçu */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setPreviewInvoice(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-3 border-b flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-sm">Facture {previewInvoice.invoiceNumber}</h3>
              <button onClick={()=>setPreviewInvoice(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {/* Émetteur & Client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Émetteur</p>
                  <p className="font-semibold text-gray-900">{user?.displayName||'Freelance'}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                  <p className="text-gray-500 text-xs">{user?.phone||''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Client</p>
                  <p className="font-semibold text-gray-900">{previewInvoice.clientName}</p>
                  <p className="text-gray-500 text-xs">{previewInvoice.clientEmail}</p>
                  {previewInvoice.clientAddress && <p className="text-gray-500 text-xs">{previewInvoice.clientAddress}</p>}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-3">
                <div><p className="text-xs text-gray-400">N°</p><p className="font-medium">{previewInvoice.invoiceNumber}</p></div>
                <div><p className="text-xs text-gray-400">Émission</p><p className="font-medium">{previewInvoice.date ? format(new Date(previewInvoice.date),'dd/MM/yyyy') : '—'}</p></div>
                <div><p className="text-xs text-gray-400">Échéance</p><p className="font-medium">{previewInvoice.dueDate ? format(new Date(previewInvoice.dueDate),'dd/MM/yyyy') : '—'}</p></div>
              </div>

              {/* Articles */}
              {previewInvoice.items?.length>0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-2">Articles</p>
                  <div className="space-y-1.5">
                    {previewInvoice.items.map((item,i)=>(
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.description} × {item.quantity}</span>
                        <span className="font-medium">{(item.quantity*item.unitPrice).toLocaleString()} XOF</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span><span>{parseFloat(previewInvoice.total||0).toLocaleString()} XOF</span>
                  </div>
                </div>
              )}

              {/* Signature plateforme */}
              <div className="border-t pt-3 text-center text-xs text-gray-400">
                <p className="font-semibold text-gray-500">Facture App</p>
                <p>Facture générée électroniquement - Signature automatique</p>
                <p className="mt-1">Signé par : <span className="font-medium text-gray-600">{user?.displayName||user?.email}</span></p>
              </div>
            </div>
            <div className="border-t px-5 py-3 flex gap-2">
              <button onClick={()=>handleDownload(previewInvoice)} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"><Download size={14}/>PDF</button>
              {previewInvoice.status!=='paid' && <button onClick={()=>handleCopyLink(previewInvoice)} className="flex-1 border text-gray-700 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5"><Link2 size={14}/>Lien</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}