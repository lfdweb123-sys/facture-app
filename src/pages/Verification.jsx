import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sendEmail } from '../services/brevo';
import { Shield, CheckCircle, Clock, AlertCircle, FileText, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verification() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(user?.verificationStatus === 'pending');

  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    birthDate: '',
    documentFront: null,
    documentBack: null,
    companyName: '',
    companyRegNumber: '',
    companyDoc: null
  });

  const documentTypes = [
    { value: 'cip', label: 'CIP (Professionnelle)', icon: '🪪' },
    { value: 'national_id', label: 'Carte Nationale d\'Identité', icon: '🆔' },
    { value: 'passport', label: 'Passeport', icon: '🌍' },
    { value: 'driving_license', label: 'Permis de conduire', icon: '🚗' },
    { value: 'business_reg', label: 'Registre de Commerce', icon: '🏢' }
  ];

  const isBusiness = formData.documentType === 'business_reg';

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 5 Mo)'); return; }
    setFormData({ ...formData, [field]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentType) { toast.error('Type de document requis'); return; }
    if (!formData.documentNumber) { toast.error('Numéro de document requis'); return; }
    if (!formData.documentFront) { toast.error('Photo recto requise'); return; }
    if (isBusiness && !formData.companyName) { toast.error('Nom entreprise requis'); return; }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending',
        verificationData: {
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          companyName: formData.companyName,
          companyRegNumber: formData.companyRegNumber,
          submittedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      // Email confirmation
      sendEmail({
        to: user.email,
        toName: user.displayName,
        subject: 'Documents de vérification soumis - Facture App',
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;"><div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:24px;text-align:center;"><div style="font-size:32px;margin-bottom:12px;">📋</div><h2 style="color:#111827;margin:0 0 8px;">Documents reçus</h2><p style="color:#6b7280;font-size:14px;">Bonjour ${user.displayName},</p><p style="color:#6b7280;font-size:14px;">Vos documents ont bien été reçus. Notre équipe les examinera sous 24 à 48 heures.</p><p style="color:#9ca3af;font-size:12px;margin-top:16px;">Facture App</p></div></div>`
      });

      setSubmitted(true);
      toast.success('Documents soumis !');
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  if (user?.verificationStatus === 'approved') {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-emerald-600"/></div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Compte vérifié</h2>
          <p className="text-sm text-gray-500">Votre identité a été validée. Toutes les fonctionnalités sont accessibles.</p>
        </div>
      </div>
    );
  }

  if (submitted && user?.verificationStatus === 'pending') {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Clock size={28} className="text-amber-600"/></div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Vérification en cours</h2>
          <p className="text-sm text-gray-500">Examen de vos documents. Délai : 24 à 48 heures.</p>
        </div>
      </div>
    );
  }

  if (user?.verificationStatus === 'rejected') {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle size={28} className="text-red-600"/></div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Vérification refusée</h2>
          <p className="text-sm text-gray-500 mb-4">Vos documents n'ont pas été acceptés.</p>
          <button onClick={() => { setSubmitted(false); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5"/>
        <div><p className="text-sm font-medium text-amber-900">Vérification requise</p><p className="text-xs text-amber-700 mt-0.5">Pour débloquer toutes les fonctionnalités, faites vérifier votre identité.</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Vérification d'identité</h2>
        <p className="text-sm text-gray-500 mb-6">Soumettez vos documents</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Type de document *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documentTypes.map(doc => (
                <button key={doc.value} type="button" onClick={()=>setFormData({...formData,documentType:doc.value})}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm ${formData.documentType===doc.value?'border-gray-900 bg-gray-50 text-gray-900 font-medium':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span>{doc.icon}</span><span>{doc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {isBusiness && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">Informations entreprise</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Nom entreprise *</label><input type="text" value={formData.companyName} onChange={e=>setFormData({...formData,companyName:e.target.value})} className={inputClass} required={isBusiness}/></div>
                <div><label className={labelClass}>N° RCCM *</label><input type="text" value={formData.companyRegNumber} onChange={e=>setFormData({...formData,companyRegNumber:e.target.value})} className={inputClass} required={isBusiness}/></div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Nom *</label><input type="text" value={formData.lastName} onChange={e=>setFormData({...formData,lastName:e.target.value})} className={inputClass} required/></div>
            <div><label className={labelClass}>Prénom(s) *</label><input type="text" value={formData.firstName} onChange={e=>setFormData({...formData,firstName:e.target.value})} className={inputClass} required/></div>
            <div><label className={labelClass}>N° document *</label><input type="text" value={formData.documentNumber} onChange={e=>setFormData({...formData,documentNumber:e.target.value})} className={inputClass} required/></div>
            <div><label className={labelClass}>Date naissance</label><input type="date" value={formData.birthDate} onChange={e=>setFormData({...formData,birthDate:e.target.value})} className={inputClass}/></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Photo recto *</label>
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 bg-gray-50">
                {formData.documentFront ? (
                  <div className="text-center">
                    <CheckCircle size={18} className="text-emerald-500 mx-auto mb-1"/>
                    <p className="text-xs text-emerald-600 font-medium truncate px-2">{formData.documentFront.name}</p>
                    <button type="button" onClick={(e)=>{e.stopPropagation();setFormData({...formData,documentFront:null});}} className="text-xs text-red-500 mt-0.5">Supprimer</button>
                  </div>
                ) : (
                  <div className="text-center"><Camera size={22} className="text-gray-400 mx-auto mb-1"/><p className="text-xs text-gray-500">Cliquez pour ajouter</p></div>
                )}
                <input type="file" accept="image/*" onChange={e=>handleFileChange(e,'documentFront')} className="hidden"/>
              </label>
            </div>
            <div>
              <label className={labelClass}>Photo verso (optionnel)</label>
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 bg-gray-50">
                {formData.documentBack ? (
                  <div className="text-center">
                    <CheckCircle size={18} className="text-emerald-500 mx-auto mb-1"/>
                    <p className="text-xs text-emerald-600 font-medium truncate px-2">{formData.documentBack.name}</p>
                    <button type="button" onClick={(e)=>{e.stopPropagation();setFormData({...formData,documentBack:null});}} className="text-xs text-red-500 mt-0.5">Supprimer</button>
                  </div>
                ) : (
                  <div className="text-center"><Upload size={22} className="text-gray-400 mx-auto mb-1"/><p className="text-xs text-gray-500">Optionnel</p></div>
                )}
                <input type="file" accept="image/*" onChange={e=>handleFileChange(e,'documentBack')} className="hidden"/>
              </label>
            </div>
          </div>

          {isBusiness && (
            <div>
              <label className={labelClass}>Registre de Commerce *</label>
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-300 bg-blue-50">
                {formData.companyDoc ? (
                  <div className="text-center">
                    <CheckCircle size={18} className="text-emerald-500 mx-auto mb-1"/>
                    <p className="text-xs text-emerald-600 font-medium">{formData.companyDoc.name}</p>
                    <button type="button" onClick={(e)=>{e.stopPropagation();setFormData({...formData,companyDoc:null});}} className="text-xs text-red-500 mt-0.5">Supprimer</button>
                  </div>
                ) : (
                  <div className="text-center"><FileText size={22} className="text-blue-400 mx-auto mb-1"/><p className="text-xs text-blue-600">Scanner RCCM</p></div>
                )}
                <input type="file" accept=".pdf,image/*" onChange={e=>handleFileChange(e,'companyDoc')} className="hidden"/>
              </label>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <Shield size={18} className="text-gray-500 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-gray-500">Documents chiffrés et stockés de manière sécurisée. Utilisés uniquement pour la vérification.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? 'Envoi...' : 'Soumettre pour vérification'}
          </button>
        </form>
      </div>
    </div>
  );
}