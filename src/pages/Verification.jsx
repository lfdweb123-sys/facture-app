import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { notifyVerificationSubmitted } from '../services/notifications';
import { Shield, CheckCircle, Clock, AlertCircle, FileText, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verification() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(user?.verificationStatus === 'pending');

  const initialFormState = {
    documentType: '',
    documentNumber: '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    birthDate: '',
    documentFront: null,
    documentFrontBase64: '',
    documentBack: null,
    documentBackBase64: '',
    companyName: '',
    companyRegNumber: '',
    companyDoc: null,
    companyDocBase64: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const documentTypes = [
    { value: 'cip', label: 'CIP (Professionnelle)', icon: '🪪' },
    { value: 'national_id', label: 'Carte Nationale d\'Identité', icon: '🆔' },
    { value: 'passport', label: 'Passeport', icon: '🌍' },
    { value: 'driving_license', label: 'Permis de conduire', icon: '🚗' },
    { value: 'business_reg', label: 'Registre de Commerce', icon: '🏢' }
  ];
  const isBusiness = formData.documentType === 'business_reg';

  // Convertir un fichier en Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 5 Mo)'); return; }
    
    try {
      const base64 = await fileToBase64(file);
      setFormData({ 
        ...formData, 
        [field]: file, 
        [`${field}Base64`]: base64 
      });
    } catch { toast.error('Erreur lecture fichier'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentType) { toast.error('Type de document requis'); return; }
    if (!formData.documentNumber) { toast.error('Numéro de document requis'); return; }
    if (!formData.documentFrontBase64) { toast.error('Photo recto requise'); return; }
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
          companyName: formData.companyName || '',
          companyRegNumber: formData.companyRegNumber || '',
          documentFrontBase64: formData.documentFrontBase64,
          documentBackBase64: formData.documentBackBase64,
          companyDocBase64: formData.companyDocBase64,
          submittedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      await notifyVerificationSubmitted(user);
      setFormData(initialFormState);
      setSubmitted(true);
      toast.success('Documents soumis !');
    } catch { toast.error('Erreur soumission'); }
    finally { setLoading(false); }
  };

  const handleRetry = () => { setSubmitted(false); setFormData(initialFormState); };
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  if (user?.verificationStatus === 'approved') return <div className="max-w-lg mx-auto p-4 sm:p-6"><div className="bg-white rounded-2xl border p-8 text-center"><CheckCircle size={32} className="text-emerald-500 mx-auto mb-3"/><h2 className="text-lg font-bold">Compte vérifié ✅</h2></div></div>;
  if (submitted && user?.verificationStatus === 'pending') return <div className="max-w-lg mx-auto p-4 sm:p-6"><div className="bg-white rounded-2xl border p-8 text-center"><Clock size={32} className="text-amber-500 mx-auto mb-3"/><h2 className="text-lg font-bold">Vérification en cours ⏳</h2><p className="text-sm text-gray-500">Examen sous 24 à 48 heures.</p></div></div>;
  if (user?.verificationStatus === 'rejected') return <div className="max-w-lg mx-auto p-4 sm:p-6"><div className="bg-white rounded-2xl border p-8 text-center"><AlertCircle size={32} className="text-red-500 mx-auto mb-3"/><h2 className="text-lg font-bold">Vérification refusée ❌</h2><button onClick={handleRetry} className="mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm">Soumettre à nouveau</button></div></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Shield size={20} className="text-amber-600 flex-shrink-0"/>
        <div><p className="text-sm font-medium text-amber-900">Vérification requise</p><p className="text-xs text-amber-700">Pour débloquer toutes les fonctionnalités.</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Vérification d'identité</h2>
        <p className="text-sm text-gray-500 mb-6">Soumettez vos documents</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Type de document *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documentTypes.map(doc => (
                <button key={doc.value} type="button" onClick={()=>setFormData({...formData,documentType:doc.value})} className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm ${formData.documentType===doc.value?'border-gray-900 bg-gray-50 text-gray-900 font-medium':'border-gray-200 text-gray-600'}`}><span>{doc.icon}</span><span>{doc.label}</span></button>
              ))}
            </div>
          </div>
          {isBusiness && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">Informations entreprise</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Nom entreprise *</label><input type="text" value={formData.companyName} onChange={e=>setFormData({...formData,companyName:e.target.value})} className={inputClass} required/></div>
                <div><label className={labelClass}>N° RCCM *</label><input type="text" value={formData.companyRegNumber} onChange={e=>setFormData({...formData,companyRegNumber:e.target.value})} className={inputClass} required/></div>
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
                {formData.documentFrontBase64 ? <img src={formData.documentFrontBase64} alt="Recto" className="h-full max-h-24 object-contain rounded"/> : <div className="text-center"><Camera size={22} className="text-gray-400"/><p className="text-xs text-gray-500">Cliquez pour ajouter</p></div>}
                <input type="file" accept="image/*" onChange={e=>handleFileChange(e,'documentFront')} className="hidden"/>
              </label>
            </div>
            <div>
              <label className={labelClass}>Photo verso (optionnel)</label>
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 bg-gray-50">
                {formData.documentBackBase64 ? <img src={formData.documentBackBase64} alt="Verso" className="h-full max-h-24 object-contain rounded"/> : <div className="text-center"><Upload size={22} className="text-gray-400"/><p className="text-xs text-gray-500">Optionnel</p></div>}
                <input type="file" accept="image/*" onChange={e=>handleFileChange(e,'documentBack')} className="hidden"/>
              </label>
            </div>
          </div>
          {isBusiness && (
            <div>
              <label className={labelClass}>Registre de Commerce *</label>
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-300 bg-blue-50">
                {formData.companyDocBase64 ? <img src={formData.companyDocBase64} alt="RCCM" className="h-full max-h-24 object-contain rounded"/> : <div className="text-center"><FileText size={22} className="text-blue-400"/><p className="text-xs text-blue-600">Scanner RCCM</p></div>}
                <input type="file" accept=".pdf,image/*" onChange={e=>handleFileChange(e,'companyDoc')} className="hidden"/>
              </label>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 flex gap-3"><Shield size={18} className="text-gray-500 flex-shrink-0"/><p className="text-xs text-gray-500">Documents chiffrés et stockés de manière sécurisée.</p></div>
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">{loading ? 'Envoi...' : 'Soumettre pour vérification'}</button>
        </form>
      </div>
    </div>
  );
}