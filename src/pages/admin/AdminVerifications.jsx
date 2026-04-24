import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { sendEmail, getVerificationStatusEmail } from '../../services/brevo';
import { CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AdminVerifications() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.verificationStatus==='pending'));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      await updateDoc(doc(db, 'users', userId), { verificationStatus: status, updatedAt: new Date().toISOString() });
      const u = users.find(u=>u.id===userId);
      const { subject, html } = getVerificationStatusEmail(u?.displayName||'Utilisateur', status);
      await sendEmail({ to: u?.email, toName: u?.displayName, subject, htmlContent: html });
      setUsers(prev=>prev.filter(u=>u.id!==userId));
      setSelected(null);
      toast.success(status==='approved'?'✅ Approuvé':'❌ Rejeté');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  if (selected) {
    const vd = selected.verificationData||{};
    return (<div className="space-y-5"><button onClick={()=>setSelected(null)} className="flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Retour</button><div className="bg-white rounded-2xl border p-6 space-y-4"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">{selected.displayName||selected.email}</h2><p className="text-sm text-gray-500">{selected.email}</p></div><div className="flex gap-2"><button onClick={()=>handleVerify(selected.id,'approved')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm"><CheckCircle size={14}/> Approuver</button><button onClick={()=>handleVerify(selected.id,'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm"><XCircle size={14}/> Rejeter</button></div></div><div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4"><div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium">{vd.documentType}</p></div><div><p className="text-xs text-gray-500">N°</p><p className="text-sm font-medium">{vd.documentNumber}</p></div><div><p className="text-xs text-gray-500">Nom</p><p className="text-sm font-medium">{vd.lastName} {vd.firstName}</p></div><div><p className="text-xs text-gray-500">Né(e) le</p><p className="text-sm font-medium">{vd.birthDate||'—'}</p></div>{vd.companyName&&<div><p className="text-xs text-gray-500">Entreprise</p><p className="text-sm font-medium">{vd.companyName}</p></div>}{vd.companyRegNumber&&<div><p className="text-xs text-gray-500">RCCM</p><p className="text-sm font-medium">{vd.companyRegNumber}</p></div>}<div><p className="text-xs text-gray-500">Soumis le</p><p className="text-sm font-medium">{vd.submittedAt?format(new Date(vd.submittedAt),'dd/MM/yyyy HH:mm',{locale:fr}):'—'}</p></div></div></div></div>);
  }

  return (<div className="space-y-5"><div><h1 className="text-xl font-bold">Vérifications en attente</h1><p className="text-xs text-gray-500">{users.length} demande{users.length>1?'s':''}</p></div>{users.length===0?<div className="bg-white rounded-2xl border p-12 text-center"><CheckCircle size={48} className="text-emerald-300 mx-auto mb-3"/><p className="text-gray-500">Aucune vérification en attente</p></div>:<div className="space-y-2">{users.map(u=>(<div key={u.id} className="bg-white rounded-xl border p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">{u.displayName?.charAt(0)||'?'}</div><div><p className="text-sm font-semibold">{u.displayName||u.email}</p><p className="text-xs text-gray-500">{u.verificationData?.documentType||'Document'} • {u.verificationData?.submittedAt?format(new Date(u.verificationData.submittedAt),'dd/MM/yy',{locale:fr}):''}</p></div></div><button onClick={()=>setSelected(u)} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg"><Eye size={14}/> Examiner</button></div>))}</div>}</div>);
}