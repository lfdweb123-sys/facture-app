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
  Users,
  CheckCircle,
  Shield,
  AlertTriangle,
  ChevronRight,
  Wallet,
  Sparkles
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

  const isVerified = user?.verificationStatus === 'approved';
  const isPending = user?.verificationStatus === 'pending';

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const invQ = query(collection(db,'invoices'),where('userId','==',user.uid),orderBy('createdAt','desc'),limit(5));
        const conQ = query(collection(db,'contracts'),where('userId','==',user.uid),orderBy('createdAt','desc'),limit(5));
        const [invS, conS] = await Promise.all([getDocs(invQ), getDocs(conQ)]);
        const invoices = invS.docs.map(d=>({id:d.id,...d.data()}));
        const contracts = conS.docs.map(d=>({id:d.id,...d.data()}));
        const totalRevenue = invoices.reduce((s,i)=>s+(parseFloat(i.total)||0),0);
        const paidAmount = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(parseFloat(i.total)||0),0);
        const pendingAmount = invoices.filter(i=>i.status==='pending').reduce((s,i)=>s+(parseFloat(i.total)||0),0);
        setStats({
          totalInvoices: invoices.length,
          totalContracts: contracts.length,
          totalRevenue, pendingAmount, paidAmount,
          activeContracts: contracts.filter(c=>c.status==='active').length,
          invoices: invoices.slice(0,5),
          recentContracts: contracts.slice(0,3)
        });
      } catch {} finally { setLoading(false); }
    })();
  }, [user]);

  const statusBadge = (s) => {
    const m = { paid:'bg-emerald-50 text-emerald-700', pending:'bg-amber-50 text-amber-700', overdue:'bg-red-50 text-red-700' };
    const l = { paid:'Payée', pending:'En attente', overdue:'En retard' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m[s]||'bg-gray-100 text-gray-600'}`}>{l[s]||'Brouillon'}</span>;
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  // Non vérifié
  if (!isVerified) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Bannière */}
        <div className={`rounded-2xl p-5 sm:p-6 ${isPending ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-amber-100' : 'bg-red-100'}`}>
              {isPending ? <Clock size={20} className="text-amber-600"/> : <AlertTriangle size={20} className="text-red-600"/>}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900">{isPending ? 'Vérification en cours' : 'Compte non vérifié'}</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {isPending ? 'Vos documents sont en cours d\'examen. Vous recevrez une notification une fois validé.' : 'Vérifiez votre identité pour débloquer toutes les fonctionnalités.'}
              </p>
            </div>
            {!isPending && (
              <Link to="/verification" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 whitespace-nowrap">
                Vérifier
              </Link>
            )}
          </div>
        </div>

        {/* Stats grisées */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-50 pointer-events-none select-none">
          {[
            { icon: DollarSign, label: 'Revenus', value: '0 XOF', color: 'bg-gray-100' },
            { icon: FileText, label: 'Factures', value: '0', color: 'bg-gray-100' },
            { icon: FileCheck, label: 'Contrats', value: '0', color: 'bg-gray-100' },
            { icon: Clock, label: 'En attente', value: '0 XOF', color: 'bg-gray-100' }
          ].map((s,i)=>(
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-2`}>
                <s.icon size={16} className="text-gray-400"/>
              </div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-bold text-gray-300">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actions grisées */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-50 pointer-events-none select-none">
          {['Nouvelle facture','Nouveau contrat','Portefeuille','Assistant IA'].map((a,i)=>(
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg mb-2"/>
              <p className="text-xs font-medium text-gray-300">{a}</p>
              <p className="text-xs text-gray-300">Vérification requise</p>
            </div>
          ))}
        </div>

        <div className="text-center py-8">
          <Shield size={32} className="text-gray-300 mx-auto mb-2"/>
          <p className="text-xs text-gray-400">Fonctionnalités disponibles après vérification</p>
        </div>
      </div>
    );
  }

  // Dashboard normal (vérifié)
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bonjour, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Aperçu de votre activité</p>
        </div>
        <div className="flex gap-2">
          <Link to="/invoices/new" className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
            <Plus size={14}/> Facture
          </Link>
          <Link to="/contracts/new" className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5">
            <Plus size={14}/> Contrat
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><DollarSign size={14} className="text-white"/></div>
          </div>
          <p className="text-xs text-gray-500">Revenus</p>
          <p className="text-sm font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} XOF</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><FileText size={14} className="text-emerald-600"/></div>
          </div>
          <p className="text-xs text-gray-500">Payées</p>
          <p className="text-sm font-bold text-emerald-600">{stats.paidAmount.toLocaleString()} XOF</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><Clock size={14} className="text-amber-600"/></div>
          </div>
          <p className="text-xs text-gray-500">En attente</p>
          <p className="text-sm font-bold text-amber-600">{stats.pendingAmount.toLocaleString()} XOF</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><FileCheck size={14} className="text-purple-600"/></div>
          </div>
          <p className="text-xs text-gray-500">Contrats actifs</p>
          <p className="text-sm font-bold text-purple-600">{stats.activeContracts}</p>
        </div>
      </div>

      {/* Listes */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Factures récentes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Factures récentes</h3>
            <Link to="/invoices" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">Voir tout <ChevronRight size={12}/></Link>
          </div>
          {stats.invoices.length===0 ? (
            <div className="p-6 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2"/>
              <p className="text-xs text-gray-500">Aucune facture</p>
              <Link to="/invoices/new" className="text-xs text-gray-900 font-medium mt-1 inline-block">+ Créer</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.invoices.map(inv=>(
                <div key={inv.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{inv.clientName||'Client'}</p>
                    <p className="text-xs text-gray-400">{inv.invoiceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs font-bold text-gray-900">{parseFloat(inv.total||0).toLocaleString()} XOF</p>
                    {statusBadge(inv.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contrats récents */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Contrats récents</h3>
            <Link to="/contracts" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">Voir tout <ChevronRight size={12}/></Link>
          </div>
          {stats.recentContracts.length===0 ? (
            <div className="p-6 text-center">
              <FileCheck size={28} className="text-gray-300 mx-auto mb-2"/>
              <p className="text-xs text-gray-500">Aucun contrat</p>
              <Link to="/contracts/new" className="text-xs text-gray-900 font-medium mt-1 inline-block">+ Créer</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentContracts.map(c=>(
                <div key={c.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{c.title||'Sans titre'}</p>
                    <p className="text-xs text-gray-400">{c.clientName||'Client'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs font-bold text-gray-900">{(parseInt(c.amount)||0).toLocaleString()} XOF</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.status==='active'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-600'}`}>
                      {c.status==='active'?'Actif':c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to:'/invoices/new', icon:FileText, label:'Nouvelle facture', desc:'Créer et envoyer' },
          { to:'/contracts/new', icon:FileCheck, label:'Nouveau contrat', desc:'Avec assistant IA' },
          { to:'/wallet', icon:Wallet, label:'Portefeuille', desc:'Soldes et retraits' },
          { to:'/ai-assistant', icon:Sparkles, label:'Assistant IA', desc:'ChatGPT & Claude' }
        ].map((a,i)=>(
          <Link key={i} to={a.to} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
              <a.icon size={14} className="text-gray-600"/>
            </div>
            <h3 className="text-xs font-semibold text-gray-900">{a.label}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}