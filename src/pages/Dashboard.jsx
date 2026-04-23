import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  FileText, 
  FileCheck, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIAssistant from '../components/ai/AIAssistant';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalContracts: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    monthlyData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('userId', '==', user.uid)
      );
      const contractsQuery = query(
        collection(db, 'contracts'),
        where('userId', '==', user.uid)
      );

      const [invoicesSnapshot, contractsSnapshot] = await Promise.all([
        getDocs(invoicesQuery),
        getDocs(contractsQuery)
      ]);

      const invoices = invoicesSnapshot.docs.map(doc => doc.data());
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const pendingPayments = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      // Données mensuelles pour le graphique
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStr = month.toLocaleString('fr-FR', { month: 'short' });
        return {
          name: monthStr,
          revenus: Math.floor(Math.random() * 500000) + 100000,
          factures: Math.floor(Math.random() * 10) + 1
        };
      }).reverse();

      setStats({
        totalInvoices: invoices.length,
        totalContracts: contractsSnapshot.docs.length,
        totalRevenue,
        pendingPayments,
        monthlyData
      });
    };

    fetchStats();
  }, [user.uid]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} XOF
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-3 rounded-xl">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <ArrowUpRight size={16} />
            <span className="text-sm ml-1">+12.5%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Factures</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <FileText className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <ArrowUpRight size={16} />
            <span className="text-sm ml-1">+8.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contrats</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileCheck className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-red-600">
            <ArrowDownRight size={16} />
            <span className="text-sm ml-1">-3.1%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingPayments.toLocaleString()} XOF
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Activity className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique et Assistant IA */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar 
                dataKey="revenus" 
                fill="url(#colorGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <AIAssistant />
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link 
          to="/invoices/new" 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <FileText size={32} className="mb-2" />
              <h3 className="text-xl font-semibold">Nouvelle Facture</h3>
              <p className="text-orange-100 mt-2">Créer une facture professionnelle</p>
            </div>
            <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </Link>

        <Link 
          to="/contracts/new" 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <FileCheck size={32} className="mb-2" />
              <h3 className="text-xl font-semibold">Nouveau Contrat</h3>
              <p className="text-blue-100 mt-2">Générer un contrat personnalisé</p>
            </div>
            <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}