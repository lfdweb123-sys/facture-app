import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { processPayout, checkPayoutStatus, detectCountryAndNetwork } from '../../services/feexpayPayout';
import { sendEmail } from '../../services/brevo';
import { CheckCircle, XCircle, RefreshCw, Settings, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AdminPayouts() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [payoutSettings, setPayoutSettings] = useState({
    autoApproveMax: 50000,
    minBalance: 1000,
    enabledCountries: ['bj']
  });

  useEffect(() => {
    loadWithdrawals();
    loadSettings();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')));
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadSettings = async () => {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const payoutDoc = snap.docs.find(d => d.id === 'payouts');
      if (payoutDoc?.exists()) {
        const data = payoutDoc.data();
        setAutoMode(data.autoMode || false);
        setPayoutSettings(prev => ({ ...prev, autoApproveMax: data.autoApproveMax || 50000, minBalance: data.minBalance || 1000, enabledCountries: data.enabledCountries || ['bj'] }));
      }
    } catch (e) { console.error('Erreur chargement settings:', e); }
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'payouts'), {
        autoApproveMax: payoutSettings.autoApproveMax,
        minBalance: payoutSettings.minBalance,
        enabledCountries: payoutSettings.enabledCountries,
        autoMode: autoMode,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Paramètres enregistrés');
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // Sauvegarder autoMode dès qu'il change
  const toggleAutoMode = async () => {
    const newMode = !autoMode;
    setAutoMode(newMode);
    try {
      await setDoc(doc(db, 'settings', 'payouts'), {
        autoMode: newMode,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success(newMode ? 'Mode automatique activé' : 'Mode manuel activé');
    } catch (error) {
      console.error('Erreur sauvegarde autoMode:', error);
      setAutoMode(!newMode); // Revenir en arrière si erreur
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleProcessPayout = async (withdrawalId) => {
    setProcessingId(withdrawalId);
    const w = withdrawals.find(w => w.id === withdrawalId);
    if (!w) return;

    try {
      const { country, network } = detectCountryAndNetwork(w.phone);

      const result = await processPayout({
        phoneNumber: w.phone,
        amount: w.amount,
        network,
        country,
        motif: `Retrait Facture App - ${w.name}`,
        email: w.userEmail
      });

      if (result.success) {
        await updateDoc(doc(db, 'withdrawals', withdrawalId), {
          status: result.status === 'SUCCESSFUL' ? 'completed' : 'pending',
          payoutRef: result.reference,
          payoutData: result.data,
          processedAt: new Date().toISOString(),
          autoProcessed: true,
          country,
          network
        });

        if (w.userEmail) {
          await sendEmail({
            to: w.userEmail,
            toName: w.name,
            subject: `Retrait ${result.status === 'SUCCESSFUL' ? 'effectué' : 'en cours'} - ${w.amount.toLocaleString()} XOF`,
            htmlContent: `<div style="font-family:Arial;padding:20px;"><h2>${result.status === 'SUCCESSFUL' ? '✅ Retrait effectué' : '⏳ Retrait en cours'}</h2><p>Montant: <strong>${w.amount.toLocaleString()} XOF</strong></p><p>Référence: ${result.reference}</p></div>`
          });
        }

        toast.success(result.status === 'SUCCESSFUL' ? '✅ Payout effectué' : '⏳ Payout en cours');
        loadWithdrawals();
      } else {
        toast.error(result.error || 'Erreur payout');
      }
    } catch (error) {
      console.error('Erreur traitement:', error);
      toast.error('Erreur lors du traitement');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyStatus = async (ref) => {
    const result = await checkPayoutStatus(ref);
    if (result.success) {
      toast.success(`Statut: ${result.status}`);
    } else {
      toast.error('Erreur vérification');
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'withdrawals', id), { status: 'completed', processedAt: new Date().toISOString() });
    loadWithdrawals();
    toast.success('Retrait marqué comme effectué');
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, 'withdrawals', id), { status: 'rejected', processedAt: new Date().toISOString() });
    loadWithdrawals();
    toast.success('Retrait rejeté');
  };

  const filtered = withdrawals.filter(w => {
    const s = search.toLowerCase();
    const match = !s || (w.name||'').toLowerCase().includes(s) || (w.phone||'').includes(s);
    if (filter === 'all') return match;
    return match && w.status === filter;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des retraits</h1>
          <p className="text-xs text-gray-500">{withdrawals.length} retraits • {withdrawals.filter(w=>w.status==='pending').length} en attente</p>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <span className="text-gray-600">Auto</span>
          <button onClick={toggleAutoMode} className={`relative w-11 h-6 rounded-full transition-colors ${autoMode ? 'bg-emerald-600' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoMode ? 'translate-x-5' : ''}`} />
          </button>
        </label>
      </div>

      {/* Paramètres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Settings size={16}/> Paramètres de payout automatique</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase mb-1 block">Montant max auto (XOF)</label>
            <input type="number" value={payoutSettings.autoApproveMax} onChange={e=>setPayoutSettings({...payoutSettings,autoApproveMax:parseInt(e.target.value)||0})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase mb-1 block">Solde minimum (XOF)</label>
            <input type="number" value={payoutSettings.minBalance} onChange={e=>setPayoutSettings({...payoutSettings,minBalance:parseInt(e.target.value)||0})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={saveSettings} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm w-full">Enregistrer</button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all','pending','completed','rejected'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===s?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>
            {s==='all'?'Tous':s==='pending'?'En attente':s==='completed'?'Effectués':'Rejetés'}
          </button>
        ))}
        <div className="flex-1"/>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40"/>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-3">Bénéficiaire</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Téléphone</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        {filtered.map(w => (
          <div key={w.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 items-center">
            <div className="col-span-3">
              <p className="text-sm font-medium text-gray-900">{w.name}</p>
              <p className="text-xs text-gray-500">{w.userEmail}</p>
            </div>
            <div className="col-span-2 text-sm font-bold text-gray-900">{parseFloat(w.amount||0).toLocaleString()} XOF</div>
            <div className="col-span-2 text-sm text-gray-600">{w.phone}</div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                w.status==='completed'?'bg-emerald-50 text-emerald-700':
                w.status==='pending'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'
              }`}>{w.status==='completed'?'Effectué':w.status==='pending'?'En attente':'Rejeté'}</span>
            </div>
            <div className="col-span-3 flex justify-end gap-1">
              {w.payoutRef && (
                <button onClick={()=>handleVerifyStatus(w.payoutRef)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Vérifier statut"><RefreshCw size={14}/></button>
              )}
              {w.status === 'pending' && (
                <>
                  <button onClick={()=>handleProcessPayout(w.id)} disabled={processingId===w.id} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Payout auto">
                    {processingId===w.id ? <Clock className="animate-spin" size={14}/> : <CheckCircle size={14}/>}
                  </button>
                  <button onClick={()=>handleApprove(w.id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Marquer effectué"><CheckCircle size={14}/></button>
                  <button onClick={()=>handleReject(w.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Rejeter"><XCircle size={14}/></button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">Aucun retrait</div>
        )}
      </div>
    </div>
  );
}