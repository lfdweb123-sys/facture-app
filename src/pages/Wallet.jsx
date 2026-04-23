import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    method: 'mobile_money',
    phone: user?.phone || '',
    name: user?.displayName || ''
  });

  // Calculer le solde à partir des factures payées
  const [balance, setBalance] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    available: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;
      try {
        // Récupérer les factures payées
        const invoicesQuery = query(
          collection(db, 'invoices'),
          where('userId', '==', user.uid),
          where('status', '==', 'paid')
        );
        const invoicesSnap = await getDocs(invoicesQuery);
        const paidInvoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalEarned = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

        // Récupérer les retraits
        let withdrawals = [];
        let totalWithdrawn = 0;
        let pendingWithdrawals = 0;
        try {
          const withdrawalsQuery = query(
            collection(db, 'withdrawals'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const withdrawalsSnap = await getDocs(withdrawalsQuery);
          withdrawals = withdrawalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          totalWithdrawn = withdrawals
            .filter(w => w.status === 'completed')
            .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
          pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
        } catch (e) {
          // Collection withdrawals pas encore créée
        }

        // Transactions combinées
        const allTransactions = [
          ...paidInvoices.map(inv => ({
            id: inv.id,
            type: 'payment',
            amount: parseFloat(inv.total) || 0,
            description: `Paiement ${inv.invoiceNumber}`,
            clientName: inv.clientName,
            date: inv.paymentDate || inv.updatedAt || inv.createdAt,
            status: 'completed'
          })),
          ...withdrawals.map(w => ({
            id: w.id,
            type: 'withdrawal',
            amount: parseFloat(w.amount) || 0,
            description: `Retrait - ${w.method}`,
            date: w.createdAt,
            status: w.status
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(allTransactions);
        setBalance({
          totalEarned,
          totalWithdrawn,
          available: totalEarned - totalWithdrawn - pendingWithdrawals,
          pendingWithdrawals
        });
      } catch (error) {
        console.error('Erreur portefeuille:', error);
        toast.error('Erreur lors du chargement du portefeuille');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [user]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }
    if (parseFloat(withdrawForm.amount) > balance.available) {
      toast.error('Solde insuffisant');
      return;
    }
    if (parseFloat(withdrawForm.amount) < 1000) {
      toast.error('Le montant minimum de retrait est de 1 000 XOF');
      return;
    }

    try {
      const withdrawalRef = await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: parseFloat(withdrawForm.amount),
        method: withdrawForm.method,
        phone: withdrawForm.phone,
        name: withdrawForm.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userEmail: user.email
      });

      toast.success('Demande de retrait envoyée avec succès');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', method: 'mobile_money', phone: user?.phone || '', name: user?.displayName || '' });
      
      // Recharger
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erreur retrait:', error);
      toast.error('Erreur lors de la demande de retrait');
    }
  };

  const getMethodLabel = (method) => {
    switch(method) {
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Virement bancaire';
      case 'card': return 'Carte bancaire';
      default: return method;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portefeuille</h1>
            <p className="text-gray-500 text-sm mt-1">Gérez vos revenus et retraits</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance.available <= 0}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Banknote size={18} />
            Retirer des fonds
          </button>
        </div>

        {/* Solde */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <Wallet size={20} />
            <span className="text-sm">Solde disponible</span>
          </div>
          <p className="text-4xl sm:text-5xl font-bold mb-2">{balance.available.toLocaleString()} XOF</p>
          <p className="text-gray-400 text-sm">Solde disponible pour retrait</p>
          
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Revenus totaux</p>
              <p className="text-lg font-semibold mt-1">{balance.totalEarned.toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Retiré</p>
              <p className="text-lg font-semibold mt-1">{balance.totalWithdrawn.toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">En attente</p>
              <p className="text-lg font-semibold mt-1 text-amber-400">{balance.pendingWithdrawals.toLocaleString()} XOF</p>
            </div>
          </div>
        </div>

        {/* Méthodes de retrait */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Méthodes de retrait disponibles</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 text-sm">Mobile Money</p>
              <p className="text-xs text-gray-500 mt-1">MTN, Moov, Celtis</p>
              <p className="text-xs text-gray-400 mt-2">1-3 jours ouvrés</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 text-sm">Virement bancaire</p>
              <p className="text-xs text-gray-500 mt-1">Compte bancaire</p>
              <p className="text-xs text-gray-400 mt-2">2-5 jours ouvrés</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 text-sm">Carte bancaire</p>
              <p className="text-xs text-gray-500 mt-1">Visa, Mastercard</p>
              <p className="text-xs text-gray-400 mt-2">Instantané</p>
            </div>
          </div>
        </div>

        {/* Historique des transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Historique des transactions</h3>
              <p className="text-sm text-gray-500">{transactions.length} transaction{transactions.length > 1 ? 's' : ''}</p>
            </div>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Download size={14} />
              Exporter
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune transaction</h3>
              <p className="text-gray-500">Vos transactions apparaîtront ici une fois que vous recevrez des paiements</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'payment' ? 'bg-emerald-100' : 
                      tx.status === 'completed' ? 'bg-blue-100' : 'bg-amber-100'
                    }`}>
                      {tx.type === 'payment' ? (
                        <ArrowDownRight size={20} className="text-emerald-600" />
                      ) : (
                        <ArrowUpRight size={20} className={tx.status === 'completed' ? 'text-blue-600' : 'text-amber-600'} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                      {tx.clientName && <p className="text-xs text-gray-500">De : {tx.clientName}</p>}
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {tx.date ? format(new Date(tx.date), 'dd MMM yyyy à HH:mm', { locale: fr }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'payment' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {tx.type === 'payment' ? '+' : '-'}{tx.amount.toLocaleString()} XOF
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.status === 'completed' ? 'Effectué' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal retrait */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWithdrawModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Retirer des fonds</h3>
                  <p className="text-sm text-gray-500">Solde disponible : {balance.available.toLocaleString()} XOF</p>
                </div>
                <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Montant (XOF)</label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="Ex: 50000"
                    min="1000"
                    max={balance.available}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum : 1 000 XOF | Maximum : {balance.available.toLocaleString()} XOF</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Méthode de retrait</label>
                  <select
                    value={withdrawForm.method}
                    onChange={(e) => setWithdrawForm({...withdrawForm, method: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="card">Carte bancaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Numéro de téléphone / Compte</label>
                  <input
                    type="text"
                    value={withdrawForm.phone}
                    onChange={(e) => setWithdrawForm({...withdrawForm, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder={withdrawForm.method === 'bank_transfer' ? 'Numéro de compte' : 'Numéro de téléphone'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nom du bénéficiaire</label>
                  <input
                    type="text"
                    value={withdrawForm.name}
                    onChange={(e) => setWithdrawForm({...withdrawForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    required
                  />
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    Le retrait sera traité sous 1 à 5 jours ouvrés selon la méthode choisie.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all"
                >
                  Confirmer le retrait de {withdrawForm.amount ? parseFloat(withdrawForm.amount).toLocaleString() : '0'} XOF
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}