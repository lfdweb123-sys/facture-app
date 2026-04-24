import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Users, FileText, FileCheck, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, verifiedUsers: 0, pendingVerifications: 0,
    totalInvoices: 0, totalContracts: 0, totalRevenue: 0, pendingDocs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, i, c] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'invoices')),
          getDocs(collection(db, 'contracts'))
        ]);
        const users = u.docs.map(d=>({id:d.id,...d.data()}));
        const invoices = i.docs.map(d=>({id:d.id,...d.data()}));
        const revenue = invoices.filter(inv=>inv.status==='paid').reduce((s,inv)=>s+(parseFloat(inv.total)||0),0);
        const pending = users.filter(u=>u.verificationStatus==='pending');
        setStats({
          totalUsers: users.length,
          verifiedUsers: users.filter(u=>u.verificationStatus==='approved').length,
          pendingVerifications: pending.length,
          totalInvoices: invoices.length,
          totalContracts: c.docs.length,
          totalRevenue: revenue,
          pendingDocs: pending.slice(0,5)
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Administration</h1><p className="text-xs text-gray-500">Gérez la plateforme</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon:Users, label:'Utilisateurs', value:stats.totalUsers, color:'bg-blue-50 text-blue-600' },
          { icon:CheckCircle, label:'Vérifiés', value:stats.verifiedUsers, color:'bg-emerald-50 text-emerald-600' },
          { icon:Clock, label:'En attente', value:stats.pendingVerifications, color:'bg-amber-50 text-amber-600' },
          { icon:FileText, label:'Factures', value:stats.totalInvoices, color:'bg-purple-50 text-purple-600' },
          { icon:FileCheck, label:'Contrats', value:stats.totalContracts, color:'bg-indigo-50 text-indigo-600' },
          { icon:DollarSign, label:'Revenus', value:`${(stats.totalRevenue/1000000).toFixed(1)}M XOF`, color:'bg-emerald-50 text-emerald-600' }
        ].map((s,i)=>(<div key={i} className="bg-white rounded-xl border p-4"><div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-2`}><s.icon size={16}/></div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold text-gray-900">{s.value}</p></div>))}
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between"><h3 className="text-sm font-semibold">Vérifications en attente ({stats.pendingVerifications})</h3><Link to="/admin/verifications" className="text-xs text-gray-900 hover:underline">Tout voir</Link></div>
        {stats.pendingDocs.length===0 ? <div className="p-8 text-center text-sm text-gray-400">Aucune</div> :
          stats.pendingDocs.map(u=>(<div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 border-b"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs font-bold">{u.displayName?.charAt(0)||'?'}</div><div><p className="text-sm font-medium">{u.displayName||u.email}</p><p className="text-xs text-gray-500">{u.verificationData?.documentType||'Document'}</p></div></div><Link to="/admin/verifications" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">Examiner</Link></div>))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[{to:'/admin/users',icon:Users,label:'Utilisateurs',desc:'Gérer les comptes'},{to:'/admin/verifications',icon:CheckCircle,label:'Vérifications',desc:'Valider les documents'}].map((a,i)=>(<Link key={i} to={a.to} className="bg-white rounded-xl border p-4 hover:border-gray-200"><div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2"><a.icon size={14} className="text-gray-600"/></div><h3 className="text-xs font-semibold">{a.label}</h3><p className="text-xs text-gray-400 mt-0.5">{a.desc}</p></Link>))}
      </div>
    </div>
  );
}