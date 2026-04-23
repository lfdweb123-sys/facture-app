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
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  Trash2,
  Copy,
  MoreVertical
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
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      try {
        const invoicesQuery = query(
          collection(db, 'invoices'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(invoicesQuery);
        const invoicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des factures');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const handleDelete = async (invoiceId) => {
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      toast.success('Facture supprimée');
      setMenuOpen(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (invoice) => {
    // Logique de duplication à implémenter
    toast.success('Facture dupliquée (à implémenter)');
    setMenuOpen(null);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = search.toLowerCase();
    const matchesSearch = search === '' ||
      (invoice.clientName || '').toLowerCase().includes(searchLower) ||
      (invoice.invoiceNumber || '').toLowerCase().includes(searchLower);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && invoice.status === statusFilter;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Brouillon';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Factures</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {invoices.length > 0 
                ? `${invoices.length} facture${invoices.length > 1 ? 's' : ''} · ${paidAmount.toLocaleString()} XOF payés`
                : 'Gérez vos factures et paiements'}
            </p>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
          >
            <Plus size={18} />
            Nouvelle facture
          </Link>
        </div>

        {/* Stats Cards */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Total</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              <p className="text-sm text-gray-500 mt-1">{totalAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Payées</p>
              <p className="text-2xl font-bold text-emerald-600">{invoices.filter(i => i.status === 'paid').length}</p>
              <p className="text-sm text-gray-500 mt-1">{paidAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{invoices.filter(i => i.status === 'pending').length}</p>
              <p className="text-sm text-gray-500 mt-1">{pendingAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">En retard</p>
              <p className="text-2xl font-bold text-red-600">{invoices.filter(i => i.status === 'overdue').length}</p>
              <p className="text-sm text-gray-500 mt-1">{overdueAmount.toLocaleString()} XOF</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une facture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {['all', 'paid', 'pending', 'overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'Toutes' : getStatusLabel(status) + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Créez votre première facture professionnelle en quelques clics.
            </p>
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
            >
              <Plus size={18} />
              Créer une facture
            </Link>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Search size={32} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500 mb-4">Aucune facture ne correspond à "{search}"</p>
            <button 
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="text-gray-900 font-medium text-sm underline hover:no-underline"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header - desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Facture</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2 text-right">Montant</div>
              <div className="col-span-2 text-center">Statut</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                {/* Mobile */}
                <div className="md:hidden p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{invoice.clientName}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setMenuOpen(menuOpen === invoice.id ? null : invoice.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                      {menuOpen === invoice.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-40 py-1">
                          <button onClick={() => { setSelectedInvoice(invoice); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Eye size={14} /> Voir
                          </button>
                          <button onClick={() => { generateInvoicePDF(invoice).save(`facture_${invoice.invoiceNumber}.pdf`); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Download size={14} /> PDF
                          </button>
                          <button onClick={() => handleDuplicate(invoice)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Copy size={14} /> Dupliquer
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{parseFloat(invoice.total || 0).toLocaleString()} XOF</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {invoice.date ? format(new Date(invoice.date), 'dd/MM/yyyy') : '—'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(invoice.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(invoice.status)}`}></span>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {invoice.date ? format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-700 truncate">{invoice.clientName || '—'}</div>
                  <div className="col-span-2 text-right">
                    <p className="font-semibold text-gray-900 text-sm">{parseFloat(invoice.total || 0).toLocaleString()} XOF</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(invoice.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(invoice.status)}`}></span>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <button 
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => generateInvoicePDF(invoice).save(`facture_${invoice.invoiceNumber}.pdf`)}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal détails */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-semibold text-gray-900">Détail facture</h3>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">N° facture</p>
                    <p className="font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedInvoice.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedInvoice.status)}`}></span>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Client</p>
                    <p className="font-medium text-gray-900">{selectedInvoice.clientName || '—'}</p>
                    <p className="text-sm text-gray-600">{selectedInvoice.clientEmail || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase mb-1">Montant</p>
                    <p className="text-xl font-bold text-gray-900">{parseFloat(selectedInvoice.total || 0).toLocaleString()} XOF</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                    <p className="text-sm text-gray-900">{selectedInvoice.date ? format(new Date(selectedInvoice.date), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Échéance</p>
                    <p className="text-sm text-gray-900">{selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                </div>

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-3">Articles</p>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description}</span>
                          <span className="text-gray-900 font-medium">{(item.quantity * item.unitPrice).toLocaleString()} XOF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
                <button 
                  onClick={() => generateInvoicePDF(selectedInvoice).save(`facture_${selectedInvoice.invoiceNumber}.pdf`)}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Télécharger PDF
                </button>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}