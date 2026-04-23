import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
  Users,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user.uid]);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title?.toLowerCase().includes(search.toLowerCase()) ||
      contract.clientName?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && contract.status === statusFilter;
  });

  const totalAmount = contracts.reduce((sum, c) => sum + (parseInt(c.amount) || 0), 0);
  const activeContracts = contracts.filter(c => c.status === 'active').length;

  const getStatusConfig = (status) => {
    switch(status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Actif' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En attente' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Terminé' };
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Annulé' };
      default:
        return { icon: FileCheck, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Brouillon' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contrats</h1>
          <p className="text-gray-600 mt-1">Gérez tous vos contrats</p>
        </div>
        <Link
          to="/contracts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Nouveau contrat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total contrats</p>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <FileCheck className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contrats actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeContracts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} XOF</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <DollarSign className="text-blue-600" size={24} />
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
              placeholder="Rechercher un contrat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <FileCheck size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun contrat</h3>
          <p className="text-gray-600 mb-6">
            {search ? 'Aucun contrat ne correspond à votre recherche' : 'Créez votre premier contrat'}
          </p>
          {!search && (
            <Link
              to="/contracts/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Créer un contrat
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const status = getStatusConfig(contract.status);
            const StatusIcon = status.icon;

            return (
              <div key={contract.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
                      <FileCheck className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                      <p className="text-gray-600">{contract.clientName}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {contract.startDate && format(new Date(contract.startDate), 'dd/MM/yyyy')}
                        </span>
                        <span>→</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {contract.endDate && format(new Date(contract.endDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {parseInt(contract.amount)?.toLocaleString()} XOF
                      </p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={20} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
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