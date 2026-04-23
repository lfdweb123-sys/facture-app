import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { askChatGPT } from '../../services/ai';
import { notifyContractCreated } from '../../services/notifications';
import { canCreateContract } from '../../services/accessControl';
import toast from 'react-hot-toast';
import { ArrowLeft, Wand2, Loader, FileCheck } from 'lucide-react';

export default function ContractForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: '', type: 'service', customType: '',
    clientName: '', clientEmail: '', clientPhone: '', clientAddress: '',
    startDate: '', endDate: '', amount: '', description: '', terms: '', aiGenerated: false,
    userName: user?.displayName || '', userEmail: user?.email || '', userCompany: user?.company || ''
  });

  const contractTypes = [
    { value: 'service', label: 'Prestation de service' }, { value: 'consulting', label: 'Consulting' },
    { value: 'development', label: 'Développement web/app' }, { value: 'design', label: 'Design graphique' },
    { value: 'marketing', label: 'Marketing digital' }, { value: 'writing', label: 'Rédaction' }, { value: 'other', label: 'Autre' }
  ];

  const generateWithAI = async () => {
    if (!formData.description || !formData.clientName) { toast.error('Description et client requis'); return; }
    setGenerating(true);
    try {
      const typeLabel = formData.type==='other' ? formData.customType : contractTypes.find(t=>t.value===formData.type)?.label;
      const prompt = `Rédige un contrat de type "${typeLabel}" entre ${formData.userName||'le prestataire'} et ${formData.clientName}. Mission : ${formData.description}. Montant : ${formData.amount} XOF. Dates : ${formData.startDate} au ${formData.endDate}.`;
      const result = await askChatGPT(prompt, 'Expert juridique. Rédige en français professionnel.');
      setFormData({...formData, terms: result, aiGenerated: true});
      toast.success('Contrat généré !');
    } catch { toast.error('Erreur IA'); }
    finally { setGenerating(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) { toast.error('Titre et client requis'); return; }

    // Vérifier limite du plan
    const contractsSnap = await getDocs(query(collection(db,'contracts'), where('userId','==',user.uid)));
    const { allowed, message, upgradeTo } = await canCreateContract(user, contractsSnap.docs.length);
    if (!allowed) {
      toast.error(message);
      if (upgradeTo) navigate('/subscription');
      return;
    }

    setLoading(true);
    try {
      const contractData = {...formData, typeLabel: formData.type==='other'?formData.customType:contractTypes.find(t=>t.value===formData.type)?.label, userId: user.uid, status: 'active', createdAt: new Date().toISOString()};
      const docRef = doc(collection(db, 'contracts'));
      await setDoc(docRef, contractData);
      await notifyContractCreated(user, { ...contractData, id: docRef.id });
      toast.success('Contrat créé !');
      navigate('/contracts');
    } catch { toast.error('Erreur création'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4"><button onClick={()=>navigate('/contracts')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18}/></button><div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nouveau contrat</h1><p className="text-xs text-gray-500">Remplissez ou générez avec l'IA</p></div></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5"><h2 className="text-sm font-semibold text-gray-900 mb-3">Type de contrat</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{contractTypes.map(t=>(<button key={t.value} type="button" onClick={()=>setFormData({...formData,type:t.value})} className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${formData.type===t.value?'border-gray-900 bg-gray-50 text-gray-900':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{t.label}</button>))}</div>{formData.type==='other'&&<input type="text" value={formData.customType} onChange={e=>setFormData({...formData,customType:e.target.value})} className={`${inputClass} mt-3`} placeholder="Précisez..."/>}</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"><h2 className="text-sm font-semibold text-gray-900">📤 Prestataire (vous)</h2><div><label className={labelClass}>Nom</label><input type="text" value={formData.userName} onChange={e=>setFormData({...formData,userName:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Email</label><input type="email" value={formData.userEmail} onChange={e=>setFormData({...formData,userEmail:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Entreprise</label><input type="text" value={formData.userCompany} onChange={e=>setFormData({...formData,userCompany:e.target.value})} className={inputClass}/></div></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"><h2 className="text-sm font-semibold text-gray-900">📥 Client</h2><div><label className={labelClass}>Nom *</label><input type="text" value={formData.clientName} onChange={e=>setFormData({...formData,clientName:e.target.value})} className={inputClass} required/></div><div><label className={labelClass}>Email (optionnel)</label><input type="email" value={formData.clientEmail} onChange={e=>setFormData({...formData,clientEmail:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Téléphone</label><input type="tel" value={formData.clientPhone} onChange={e=>setFormData({...formData,clientPhone:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Adresse</label><input type="text" value={formData.clientAddress} onChange={e=>setFormData({...formData,clientAddress:e.target.value})} className={inputClass}/></div></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className={labelClass}>Titre *</label><input type="text" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className={inputClass} required/></div><div><label className={labelClass}>Montant (XOF)</label><input type="number" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})} className={inputClass} min="0"/></div><div><label className={labelClass}>Date début</label><input type="date" value={formData.startDate} onChange={e=>setFormData({...formData,startDate:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Date fin</label><input type="date" value={formData.endDate} onChange={e=>setFormData({...formData,endDate:e.target.value})} className={inputClass}/></div></div><div><label className={labelClass}>Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className={inputClass} rows="3"/></div></div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5"><div className="flex items-center justify-between mb-3"><div><h3 className="text-sm font-semibold text-gray-900">🤖 Assistant IA</h3><p className="text-xs text-gray-500">Générez les clauses</p></div><button type="button" onClick={generateWithAI} disabled={generating} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5">{generating?<><Loader className="animate-spin" size={14}/> Génération...</>:<><Wand2 size={14}/> Générer</>}</button></div><textarea value={formData.terms} onChange={e=>setFormData({...formData,terms:e.target.value})} className="w-full px-3 py-2.5 border border-purple-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-purple-500 outline-none bg-white" rows="10" placeholder="Termes du contrat..."/>{formData.aiGenerated&&<p className="text-xs text-purple-600 mt-2">✨ Généré par IA - Vérifiez avant validation</p>}</div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center text-xs text-gray-500"><p className="font-medium text-gray-700">Facture App</p><p>Contrat généré électroniquement - Signé par : <span className="font-semibold text-gray-700">{formData.userName||user?.displayName||user?.email}</span></p></div>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{loading?<><Loader className="animate-spin" size={16}/> Création...</>:<><FileCheck size={16}/> Créer le contrat</>}</button>
      </form>
    </div>
  );
}