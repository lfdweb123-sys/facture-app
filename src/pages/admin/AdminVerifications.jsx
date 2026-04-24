import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { sendEmail, getVerificationStatusEmail } from '../../services/brevo';
import { CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminVerifications() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const pending = snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.verificationStatus==='pending');
      setUsers(pending);
      setLoading(false);
    };
    load();
  }, []);

  const handleVerification = async (userId, status) => {
    try {
      await updateDoc(doc(db, 'users', userId), { verificationStatus: status, updatedAt: new Date().toISOString() });
      const userData = users.find(u => u.id === userId);
      const { subject, html } = getVerificationStatusEmail(userData?.displayName || 'Utilisateur', status);
      await sendEmail({ to: userData?.email, toName: userData?.displayName, subject, htmlContent: html });
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null);
      toast.success(status === 'approved' ? '✅ Compte approuvé' : '❌ Compte rejeté');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;

  if (selectedUser) {
    const u = selectedUser;
    const vd = u.verificationData || {};
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft size={16}/> Retour</button>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{u.displayName || u.email}</h2>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleVerification(u.id, 'approved')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5"><CheckCircle size={14}/> Approuver</button>
              <button onClick={() => handleVerification(u.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 flex items-center gap-1.5"><XCircle size={14}/> Rejeter</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
            <div><p className="text-xs text-gray-500">Type document</p><p className="text-sm font-medium">{vd.documentType}</p></div>
            <div><p className="text-xs text-gray-500">N° document</p><p className="text-sm font-medium">{vd.documentNumber}</p></div>
            <div><p className="text-xs text-gray-500">Nom</p><p className="text-sm font-medium">{vd.lastName} {vd.firstName}</p></div>
            <div><p className="text-xs text-gray-500">Date naissance</p><p className="text-sm font-medium">{vd.birthDate || '—'}</p></div>
            {vd.companyName && <div><p className="text-xs text-gray-500">Entreprise</p><p className="text-sm font-medium">{vd.companyName}</p></div>}
            {vd.companyRegNumber && <div><p className="text-xs text-gray-500">RCCM</p><p className="text-sm font-medium">{vd.companyRegNumber}</p></div>}
            <div><p className="text-xs text-gray-500">Soumis le</p><p className="text-sm font-medium">{vd.submittedAt ? format(new Date(vd.submittedAt), 'dd/MM/yyyy à HH:mm', {locale:fr}) : '—'}</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vérifications en attente</h1><p className="text-xs text-gray-500">{users.length} demande{users.length>1?'s':''}</p></div>
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle size={48} className="text-emerald-300 mx-auto mb-3"/>
          <p className="text-gray-500">Aucune vérification en attente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">{u.displayName?.charAt(0)||'?'}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.displayName||u.email}</p>
                  <p className="text-xs text-gray-500">{u.verificationData?.documentType||'Document'} • {u.verificationData?.submittedAt ? format(new Date(u.verificationData.submittedAt), 'dd/MM/yy', {locale:fr}) : ''}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(u)} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-1.5"><Eye size={14}/> Examiner</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}