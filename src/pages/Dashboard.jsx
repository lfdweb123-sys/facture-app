import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  DollarSign,
  Clock,
  Plus,
  ArrowUpRight,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalContracts: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    activeContracts: 0,
    invoices: [],
    recentContracts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les factures
        const invoicesQuery = query(
          collection(db, 'invoices'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        // Récupérer les contrats
        const contractsQuery = query(
          collection(db, 'contracts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const [invoicesSnapshot, contractsSnapshot] = await Promise.all([
          getDocs(invoicesQuery),
          getDocs(contractsQuery)
        ]);

        const invoices = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const contracts = contractsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculer les statistiques
        const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        const paidAmount = invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        const pendingAmount = invoices
          .filter(inv => inv.status === 'pending')
          .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        const activeContracts = contracts.filter(c => c.status === 'active').length;

        setStats({
          totalInvoices: invoices.length,
          totalContracts: contracts.length,
          totalRevenue,
          pendingAmount,
          paidAmount,
          activeContracts,
          invoices: invoices.slice(0, 5),
          recentContracts: contracts.slice(0, 3)
        });
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger les données. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 rounded-2xl p-8 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Bonjour, {user?.displayName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 mt-1">Voici un aperçu de votre activité</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nouvelle facture</span>
            </Link>
            <Link
              to="/contracts/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nouveau contrat</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">XOF</span></p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="text-white" size={20} />
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.totalInvoices} total</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Factures</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paidAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">XOF payés</span></p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileCheck className="text-white" size={20} />
              </div>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{stats.activeContracts} actifs</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Contrats</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalContracts} <span className="text-sm font-normal text-gray-500">contrats</span></p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <AlertCircle size={20} className="text-amber-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">XOF</span></p>
          </div>
        </div>

        {/* Récentes factures + Contrats */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Factures récentes */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Factures récentes</h2>
                <p className="text-sm text-gray-500">{stats.totalInvoices} facture{stats.totalInvoices > 1 ? 's' : ''} au total</p>
              </div>
              <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            
            {stats.invoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Aucune facture pour le moment</p>
                <Link to="/invoices/new" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  + Créer votre première facture
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{invoice.clientName || 'Client'}</p>
                        <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">{parseFloat(invoice.total || 0).toLocaleString()} XOF</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contrats récents */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Contrats récents</h2>
                <p className="text-sm text-gray-500">{stats.activeContracts} contrat{stats.activeContracts > 1 ? 's' : ''} actif{stats.activeContracts > 1 ? 's' : ''}</p>
              </div>
              <Link to="/contracts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            
            {stats.recentContracts.length === 0 ? (
              <div className="p-8 text-center">
                <FileCheck size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Aucun contrat pour le moment</p>
                <Link to="/contracts/new" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  + Créer votre premier contrat
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.recentContracts.map((contract) => (
                  <div key={contract.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{contract.title || 'Sans titre'}</p>
                        <p className="text-sm text-gray-500">{contract.clientName || 'Client'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">{parseInt(contract.amount || 0).toLocaleString()} XOF</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {contract.status === 'active' ? 'Actif' : contract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/invoices/new" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <FileText className="text-orange-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Nouvelle facture</h3>
            <p className="text-sm text-gray-500">Créer une facture professionnelle</p>
          </Link>

          <Link to="/contracts/new" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <FileCheck className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Nouveau contrat</h3>
            <p className="text-sm text-gray-500">Générer un contrat avec IA</p>
          </Link>

          <Link to="/ai-assistant" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Assistant IA</h3>
            <p className="text-sm text-gray-500">ChatGPT & Claude à votre service</p>
          </Link>

          <Link to="/profile" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
              <Users className="text-gray-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Mon profil</h3>
            <p className="text-sm text-gray-500">Gérer vos informations</p>
          </Link>
        </div>

      </div>
    </div>
  );
}