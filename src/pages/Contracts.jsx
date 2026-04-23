import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;

      try {
        const contractsQuery = query(
          collection(db, 'contracts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(contractsQuery);
        const contractsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setContracts(contractsData);
      } catch (error) {
        console.error('Erreur chargement contrats:', error);
        toast.error('Erreur lors du chargement des contrats');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const handleDelete = async (contractId) => {
    if (!confirm('Supprimer ce contrat ? Cette action est irréversible.')) return;

    try {
      await deleteDoc(doc(db, 'contracts', contractId));
      setContracts(prev => prev.filter(c => c.id !== contractId));
      toast.success('Contrat supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const searchLower = search.toLowerCase();
    const matchesSearch = search === '' || 
      (contract.title || '').toLowerCase().includes(searchLower) ||
      (contract.clientName || '').toLowerCase().includes(searchLower);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && contract.status === statusFilter;
  });

  const totalAmount = contracts.reduce((sum, c) => sum + (parseInt(c.amount) || 0), 0);
  const activeContracts = contracts.filter(c => c.status === 'active').length;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return { bg: 'bg-emerald-100 text-emerald-700', label: 'Actif' };
      case 'pending':
        return { bg: 'bg-amber-100 text-amber-700', label: 'En attente' };
      case 'completed':
        return { bg: 'bg-blue-100 text-blue-700', label: 'Terminé' };
      case 'cancelled':
        return { bg: 'bg-red-100 text-red-700', label: 'Annulé' };
      default:
        return { bg: 'bg-gray-100 text-gray-700', label: 'Brouillon' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des contrats...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contrats</h1>
            <p className="text-gray-600 mt-1">
              {contracts.length > 0 
                ? `${contracts.length} contrat${contracts.length > 1 ? 's' : ''} • ${activeContracts} actif${activeContracts > 1 ? 's' : ''}`
                : 'Gérez vos contrats'}
            </p>
          </div>
          <Link
            to="/contracts/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Nouveau contrat
          </Link>
        </div>

        {/* Stats */}
        {contracts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileCheck size={20} className="text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Actifs</p>
              <p className="text-2xl font-bold text-emerald-600">{activeContracts}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileCheck size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Montant total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">XOF</span></p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{contracts.filter(c => c.status === 'pending').length}</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par titre ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>

        {/* Liste contrats */}
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileCheck size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun contrat</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Créez votre premier contrat professionnel. L'IA vous aide à rédiger des contrats complets.
            </p>
            <Link
              to="/contracts/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Créer un contrat
            </Link>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500">
              Aucun contrat ne correspond à "{search}"
            </p>
            <button 
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContracts.map((contract) => {
              const statusBadge = getStatusBadge(contract.status);

              return (
                <div key={contract.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    
                    {/* Infos contrat */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileCheck size={20} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {contract.title || 'Sans titre'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {contract.clientName || 'Client non renseigné'}
                        </p>
                        {(contract.startDate || contract.endDate) && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>
                              {contract.startDate ? format(new Date(contract.startDate), 'dd/MM/yyyy') : '—'}
                            </span>
                            <span>→</span>
                            <span>
                              {contract.endDate ? format(new Date(contract.endDate), 'dd/MM/yyyy') : '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Montant + Statut + Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {(parseInt(contract.amount) || 0).toLocaleString()} XOF
                        </p>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setSelectedContract(contract)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(contract.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal détails contrat */}
        {selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedContract(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedContract.title}</h2>
                <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Client</label>
                  <p className="text-gray-900">{selectedContract.clientName}</p>
                  <p className="text-sm text-gray-600">{selectedContract.clientEmail}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Début</label>
                    <p className="text-gray-900">{selectedContract.startDate ? format(new Date(selectedContract.startDate), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Fin</label>
                    <p className="text-gray-900">{selectedContract.endDate ? format(new Date(selectedContract.endDate), 'dd MMMM yyyy', { locale: fr }) : '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Montant</label>
                  <p className="text-xl font-bold text-gray-900">{(parseInt(selectedContract.amount) || 0).toLocaleString()} XOF</p>
                </div>
                {selectedContract.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                    <p className="text-sm text-gray-700 mt-1">{selectedContract.description}</p>
                  </div>
                )}
                {selectedContract.terms && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Termes du contrat</label>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                      {selectedContract.terms}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}