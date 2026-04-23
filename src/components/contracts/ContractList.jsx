import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ContractList() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchContracts = async () => {
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
        console.error('Erreur lors du chargement des contrats:', error);
        toast.error('Erreur lors du chargement des contrats');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user.uid]);

  const handleDelete = async (contractId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;

    try {
      await deleteDoc(doc(db, 'contracts', contractId));
      setContracts(contracts.filter(c => c.id !== contractId));
      toast.success('Contrat supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du contrat');
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title?.toLowerCase().includes(search.toLowerCase()) ||
      contract.clientName?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && contract.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Actif' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Terminé' },
      cancelled: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Annulé' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={14} />
        <span>{config.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contrats</h1>
        <Link
          to="/contracts/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Nouveau contrat</span>
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un contrat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les contrats</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      {/* Liste des contrats */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de contrat</p>
            <Link
              to="/contracts/new"
              className="inline-flex items-center space-x-2 text-white bg-gradient-to-r from-blue-600 to-orange-500 px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>Créer mon premier contrat</span>
            </Link>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
                      <FileCheck className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {contract.title}
                      </h3>
                      <p className="text-sm text-gray-600">{contract.clientName}</p>
                    </div>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Du {contract.startDate && format(new Date(contract.startDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Au {contract.endDate && format(new Date(contract.endDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {parseInt(contract.amount)?.toLocaleString()} XOF
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {contract.aiGenerated && (
                      <span className="inline-flex items-center space-x-1 text-purple-600">
                        <span>🤖</span>
                        <span>Généré par IA</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(contract.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {contracts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">Total contrats</p>
            <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">Contrats actifs</p>
            <p className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {contracts.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">Montant total</p>
            <p className="text-2xl font-bold text-blue-600">
              {contracts.reduce((sum, c) => sum + (parseInt(c.amount) || 0), 0).toLocaleString()} XAF
            </p>
          </div>
        </div>
      )}
    </div>
  );
}