import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { sendEmail, getVerificationStatusEmail } from '../../services/brevo';
import { CheckCircle, XCircle, Eye, ArrowLeft, X, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

function FileText({ size, className }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}

export default function AdminVerifications() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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

  return (
    <div className="space-y-5">
      {/* Popup preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><X size={20}/></button>
            <img src={previewImage} alt="Document" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
          </div>
        </div>
      )}

      {selected ? (
        <div className="space-y-5">
          <button onClick={()=>setSelected(null)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft size={16}/> Retour</button>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.displayName || selected.email}</h2>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Soumis le {selected.verificationData?.submittedAt ? format(new Date(selected.verificationData.submittedAt), 'dd MMMM yyyy à HH:mm', {locale: fr}) : '—'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleVerify(selected.id,'approved')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5"><CheckCircle size={14}/> Approuver</button>
                <button onClick={()=>handleVerify(selected.id,'rejected')} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 flex items-center gap-1.5"><XCircle size={14}/> Rejeter</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div><p className="text-xs text-gray-500 uppercase">Type</p><p className="text-sm font-medium">{selected.verificationData?.documentType}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">N°</p><p className="text-sm font-medium">{selected.verificationData?.documentNumber}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Nom</p><p className="text-sm font-medium">{selected.verificationData?.lastName} {selected.verificationData?.firstName}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Né(e) le</p><p className="text-sm font-medium">{selected.verificationData?.birthDate ? format(new Date(selected.verificationData.birthDate), 'dd/MM/yyyy') : '—'}</p></div>
              {selected.verificationData?.companyName && <div><p className="text-xs text-gray-500 uppercase">Entreprise</p><p className="text-sm font-medium">{selected.verificationData.companyName}</p></div>}
              {selected.verificationData?.companyRegNumber && <div><p className="text-xs text-gray-500 uppercase">RCCM</p><p className="text-sm font-medium">{selected.verificationData.companyRegNumber}</p></div>}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Documents soumis</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-3">Photo recto</p>
                  {selected.verificationData?.documentFrontBase64 ? (
                    <img src={selected.verificationData.documentFrontBase64} alt="Recto" className="w-full h-48 object-contain rounded-lg cursor-pointer bg-gray-50" onClick={() => setPreviewImage(selected.verificationData.documentFrontBase64)} />
                  ) : <p className="text-xs text-gray-400 py-12">Non fourni</p>}
                </div>
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase mb-3">Photo verso</p>
                  {selected.verificationData?.documentBackBase64 ? (
                    <img src={selected.verificationData.documentBackBase64} alt="Verso" className="w-full h-48 object-contain rounded-lg cursor-pointer bg-gray-50" onClick={() => setPreviewImage(selected.verificationData.documentBackBase64)} />
                  ) : <p className="text-xs text-gray-400 py-12">Non fourni</p>}
                </div>
              </div>
              {selected.verificationData?.companyDocBase64 && (
                <div className="mt-4 border border-blue-200 rounded-xl p-4 text-center bg-blue-50">
                  <p className="text-xs text-gray-500 uppercase mb-3">Registre de Commerce</p>
                  <img src={selected.verificationData.companyDocBase64} alt="RCCM" className="w-full h-48 object-contain rounded-lg cursor-pointer" onClick={() => setPreviewImage(selected.verificationData.companyDocBase64)} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div><h1 className="text-xl font-bold text-gray-900">Vérifications en attente</h1><p className="text-xs text-gray-500">{users.length} demande{users.length>1?'s':''}</p></div>
          {users.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center"><CheckCircle size={48} className="text-emerald-300 mx-auto mb-3"/><p className="text-gray-500">Aucune vérification en attente</p></div>
          ) : (
            <div className="space-y-2">{users.map(u => (
              <div key={u.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">{u.displayName?.charAt(0)||'?'}</div>
                  <div><p className="text-sm font-semibold">{u.displayName||u.email}</p><p className="text-xs text-gray-500">{u.verificationData?.documentType} • {u.verificationData?.submittedAt ? format(new Date(u.verificationData.submittedAt), 'dd/MM/yy', {locale: fr}) : ''}</p></div>
                </div>
                <button onClick={()=>setSelected(u)} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg"><Eye size={14}/> Examiner</button>
              </div>
            ))}</div>
          )}
        </>
      )}
    </div>
  );
}