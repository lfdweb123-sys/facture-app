import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { askChatGPT } from '../../services/ai';
import { sendEmail, getInvoiceEmailTemplate } from '../../services/brevo';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Sparkles, Loader } from 'lucide-react';

export default function InvoiceForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const [formData, setFormData] = useState({
    userName: user?.displayName || '',
    userEmail: user?.email || '',
    userPhone: user?.phone || '',
    userCompany: user?.company || '',
    userAddress: user?.address || '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    invoiceNumber: `FACT-${new Date().getFullYear()}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }],
    notes: '',
    terms: 'Paiement dû à réception de la facture.'
  });

  const addItem = () => setFormData({...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, tax: 0 }]});
  const removeItem = (i) => setFormData({...formData, items: formData.items.filter((_,idx) => idx !== i)});
  const updateItem = (i, f, v) => {
    const items = [...formData.items];
    items[i][f] = f === 'description' ? v : parseFloat(v) || 0;
    setFormData({...formData, items});
  };

  const subtotal = formData.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = formData.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.tax/100), 0);
  const total = subtotal + taxTotal;

  // Génération IA de la facture
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) { toast.error('Décrivez la facture à générer'); return; }
    setAiLoading(true);
    try {
      const prompt = `Génère une facture professionnelle à partir de cette description : "${aiPrompt}"
      
      Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte, sans texte avant ni après :
      {
        "clientName": "Nom du client",
        "clientEmail": "email@client.com",
        "clientPhone": "+229...",
        "clientAddress": "Adresse",
        "invoiceNumber": "FACT-2026-XXX",
        "items": [
          {"description": "Article", "quantity": 1, "unitPrice": 50000, "tax": 0}
        ],
        "notes": "Notes",
        "terms": "Conditions de paiement"
      }
      
      Remplis avec des valeurs réalistes. Le montant total doit être cohérent.`;

      const result = await askChatGPT(prompt, 'Tu es un assistant de facturation. Réponds UNIQUEMENT avec le JSON demandé, pas de texte autour.');
      
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { toast.error('Format IA invalide'); return; }
      
      const aiData = JSON.parse(jsonMatch[0]);
      
      setFormData(prev => ({
        ...prev,
        clientName: aiData.clientName || prev.clientName,
        clientEmail: aiData.clientEmail || prev.clientEmail,
        clientPhone: aiData.clientPhone || prev.clientPhone,
        clientAddress: aiData.clientAddress || prev.clientAddress,
        invoiceNumber: aiData.invoiceNumber || prev.invoiceNumber,
        items: aiData.items?.length ? aiData.items : prev.items,
        notes: aiData.notes || prev.notes,
        terms: aiData.terms || prev.terms
      }));

      toast.success('Facture générée par IA !');
    } catch (err) {
      console.error('Erreur IA:', err);
      toast.error('Erreur lors de la génération IA');
    } finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName) { toast.error('Nom du client requis'); return; }
    if (formData.items.length===0 || formData.items.every(i=>!i.description)) { toast.error('Ajoutez au moins un article'); return; }
    setLoading(true);
    try {
      const invoiceData = {
        ...formData, userId: user.uid, subtotal, taxTotal, total,
        status: 'pending', createdAt: new Date().toISOString()
      };
      const docRef = doc(collection(db, 'invoices'));
      await setDoc(docRef, invoiceData);

      if (formData.clientEmail && formData.clientEmail.trim()) {
        const paymentLink = `${window.location.origin}/pay?invoice=${docRef.id}`;
        sendEmail({
          to: formData.clientEmail,
          toName: formData.clientName,
          subject: `Facture ${formData.invoiceNumber} - ${total.toLocaleString()} XOF`,
          htmlContent: getInvoiceEmailTemplate({ ...invoiceData, id: docRef.id }, paymentLink)
        }).then(res => {
          if (res.success) toast.success('Facture créée et envoyée !');
          else toast.success('Facture créée (email non envoyé)');
        });
      } else {
        toast.success('Facture créée !');
      }
      navigate('/invoices');
    } catch (err) { toast.error('Erreur création'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={()=>navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18}/></button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nouvelle facture</h1>
          <p className="text-xs text-gray-500">Créez manuellement ou générez avec l'IA</p>
        </div>
      </div>

      {/* IA Generator */}
      <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-600"/>
          <h3 className="text-sm font-semibold text-gray-900">Assistant IA</h3>
          <span className="text-xs text-purple-600 font-medium">Décrivez votre facture, l'IA la génère</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={e=>setAiPrompt(e.target.value)}
            placeholder="Ex: Facture de 50 000 XOF pour Simplice Akouessi, design logo et carte de visite..."
            className="flex-1 px-3 py-2.5 border border-purple-200 rounded-xl text-sm focus:ring-1 focus:ring-purple-500 outline-none bg-white"
            onKeyDown={e=>e.key==='Enter' && generateWithAI()}
          />
          <button
            type="button"
            onClick={generateWithAI}
            disabled={aiLoading || !aiPrompt.trim()}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            {aiLoading ? <Loader className="animate-spin" size={14}/> : <Sparkles size={14}/>}
            {aiLoading ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">📤 Émetteur (vous)</h2>
            <div><label className={labelClass}>Nom</label><input type="text" value={formData.userName} onChange={e=>setFormData({...formData,userName:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Email</label><input type="email" value={formData.userEmail} onChange={e=>setFormData({...formData,userEmail:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Téléphone</label><input type="tel" value={formData.userPhone} onChange={e=>setFormData({...formData,userPhone:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Entreprise</label><input type="text" value={formData.userCompany} onChange={e=>setFormData({...formData,userCompany:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Adresse</label><input type="text" value={formData.userAddress} onChange={e=>setFormData({...formData,userAddress:e.target.value})} className={inputClass}/></div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">📥 Client</h2>
            <div><label className={labelClass}>Nom *</label><input type="text" value={formData.clientName} onChange={e=>setFormData({...formData,clientName:e.target.value})} className={inputClass} required/></div>
            <div><label className={labelClass}>Email <span className="text-gray-400 font-normal">(optionnel, envoi auto)</span></label><input type="email" value={formData.clientEmail} onChange={e=>setFormData({...formData,clientEmail:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Téléphone</label><input type="tel" value={formData.clientPhone} onChange={e=>setFormData({...formData,clientPhone:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Adresse</label><textarea value={formData.clientAddress} onChange={e=>setFormData({...formData,clientAddress:e.target.value})} className={inputClass} rows="2"/></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>N° Facture</label><input type="text" value={formData.invoiceNumber} onChange={e=>setFormData({...formData,invoiceNumber:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Date émission</label><input type="date" value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Date échéance</label><input type="date" value={formData.dueDate} onChange={e=>setFormData({...formData,dueDate:e.target.value})} className={inputClass}/></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Articles</h2>
            <button type="button" onClick={addItem} className="text-xs font-medium text-gray-900 hover:underline flex items-center gap-1"><Plus size={14}/> Ajouter</button>
          </div>
          <div className="space-y-3">
            {formData.items.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><label className="text-xs text-gray-400 mb-1 block">Description</label><input type="text" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none"/></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Qté</label><input type="number" value={item.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none" min="1"/></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Prix</label><input type="number" value={item.unitPrice} onChange={e=>updateItem(i,'unitPrice',e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none" min="0" step="100"/></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Taxe %</label><select value={item.tax} onChange={e=>updateItem(i,'tax',e.target.value)} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white"><option value="0">0%</option><option value="10">10%</option><option value="18">18%</option><option value="20">20%</option></select></div>
                  <div className="col-span-1 flex justify-end">{formData.items.length>1 && <button type="button" onClick={()=>removeItem(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>}</div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">Ligne : {(item.quantity*item.unitPrice).toLocaleString()} XOF</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{subtotal.toLocaleString()} XOF</span></div>
            <div className="flex justify-between text-gray-600"><span>TVA</span><span>{taxTotal.toLocaleString()} XOF</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-1 border-t"><span>Total</span><span>{total.toLocaleString()} XOF</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div><label className={labelClass}>Notes</label><textarea value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} className={inputClass} rows="2"/></div>
          <div><label className={labelClass}>Conditions de paiement</label><input type="text" value={formData.terms} onChange={e=>setFormData({...formData,terms:e.target.value})} className={inputClass}/></div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 text-center text-xs text-gray-500">
          <p className="font-medium text-gray-700">Facture App</p>
          <p>Signature automatique : <span className="font-semibold text-gray-700">{formData.userName || user?.displayName || user?.email}</span></p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
          {loading ? 'Création...' : `Créer la facture - ${total.toLocaleString()} XOF`}
        </button>
      </form>
    </div>
  );
}