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
  Copy,
  Trash2,
  Calendar,
  X,
  Link2,
  CheckCircle,
  Clock,
  AlertCircle
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
  const [previewInvoice, setPreviewInvoice] = useState(null);

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
        console.error('Erreur chargement factures:', error);
        toast.error('Erreur lors du chargement');
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
      setSelectedInvoice(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCopyPaymentLink = (invoice) => {
    const link = `${window.location.origin}/pay?invoice=${invoice.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien de paiement copié !');
  };

  const handleDownloadPDF = (invoice) => {
    try {
      const doc = generateInvoicePDF(invoice);
      doc.save(`facture_${invoice.invoiceNumber}.pdf`);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleViewInvoice = (invoice) => {
    setPreviewInvoice(invoice);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = search.toLowerCase();
    const matchesSearch = search === '' ||
      (invoice.clientName || '').toLowerCase().includes(searchLower) ||
      (invoice.invoiceNumber || '').toLowerCase().includes(searchLower);
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && invoice.status === statusFilter;
  });

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
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
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
            <p className="text-gray-500 text-sm mt-1">
              {invoices.length > 0 
                ? `${invoices.length} facture${invoices.length > 1 ? 's' : ''}`
                : 'Créez et envoyez des factures à vos clients'}
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

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'pending', 'paid', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'Toutes' : getStatusLabel(status) + 's'}
              </button>
            ))}
            <div className="flex-1" />
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none w-40 sm:w-56"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture</h3>
            <p className="text-gray-500 mb-6">Créez votre première facture et envoyez-la à votre client</p>
            <Link to="/invoices/new" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all inline-flex items-center gap-2">
              <Plus size={18} /> Créer une facture
            </Link>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune facture ne correspond</p>
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="mt-4 text-gray-900 font-medium underline">
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  
                  {/* Infos */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 truncate">{invoice.clientName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {invoice.date ? format(new Date(invoice.date), 'dd/MM/yyyy') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Montant + Statut */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{parseFloat(invoice.total || 0).toLocaleString()} XOF</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(invoice.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(invoice.status)}`}></span>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Voir détails */}
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Télécharger PDF */}
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Télécharger PDF"
                      >
                        <Download size={18} />
                      </button>

                      {/* Copier lien paiement */}
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handleCopyPaymentLink(invoice)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Copier le lien de paiement"
                        >
                          <Link2 size={18} />
                        </button>
                      )}

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal aperçu facture */}
        {previewInvoice && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewInvoice(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-semibold text-gray-900">Facture {previewInvoice.invoiceNumber}</h3>
                <button onClick={() => setPreviewInvoice(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* En-tête facture */}
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Émetteur</p>
                    <p className="font-semibold text-gray-900">{user?.displayName || 'Freelance'}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(previewInvoice.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(previewInvoice.status)}`}></span>
                      {getStatusLabel(previewInvoice.status)}
                    </span>
                  </div>
                </div>

                {/* Client */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Client</p>
                  <p className="font-semibold text-gray-900">{previewInvoice.clientName}</p>
                  <p className="text-sm text-gray-600">{previewInvoice.clientEmail}</p>
                  {previewInvoice.clientAddress && <p className="text-sm text-gray-500">{previewInvoice.clientAddress}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Date d'émission</p>
                    <p className="text-sm text-gray-900">{previewInvoice.date ? format(new Date(previewInvoice.date), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Date d'échéance</p>
                    <p className="text-sm text-gray-900">{previewInvoice.dueDate ? format(new Date(previewInvoice.dueDate), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                </div>

                {/* Articles */}
                {previewInvoice.items && previewInvoice.items.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-3">Articles</p>
                    <div className="space-y-2">
                      {previewInvoice.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description} × {item.quantity}</span>
                          <span className="text-gray-900 font-medium">{(item.quantity * item.unitPrice).toLocaleString()} XOF</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{parseFloat(previewInvoice.total || 0).toLocaleString()} XOF</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {previewInvoice.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{previewInvoice.notes}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
                <button 
                  onClick={() => handleDownloadPDF(previewInvoice)}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Télécharger PDF
                </button>
                {previewInvoice.status !== 'paid' && (
                  <button 
                    onClick={() => handleCopyPaymentLink(previewInvoice)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Link2 size={16} /> Copier lien paiement
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}