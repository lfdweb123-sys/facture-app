import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateInvoicePDF } from '../services/pdf';

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user.uid]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && invoice.status === statusFilter;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Payée' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En attente' };
      case 'overdue':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'En retard' };
      default:
        return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Brouillon' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-1">Gérez toutes vos factures</p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total factures</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payées</option>
            <option value="pending">En attente</option>
            <option value="overdue">En retard</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune facture</h3>
          <p className="text-gray-600 mb-6">
            {search ? 'Aucune facture ne correspond à votre recherche' : 'Créez votre première facture'}
          </p>
          {!search && (
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Créer une facture
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const status = getStatusConfig(invoice.status);
            const StatusIcon = status.icon;

            return (
              <div key={invoice.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-orange-100 to-blue-100 p-3 rounded-xl">
                      <FileText className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <p className="text-gray-600">{invoice.clientName}</p>
                      {invoice.date && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {invoice.total?.toLocaleString()} XOF
                      </p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          const doc = generateInvoicePDF(invoice);
                          doc.save(`facture_${invoice.invoiceNumber}.pdf`);
                        }}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}