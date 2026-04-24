import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, app } from '../services/firebase';
import { getAuth, updatePassword, sendEmailVerification } from 'firebase/auth';
import { getUserRestrictions } from '../services/accessControl';
import toast from 'react-hot-toast';
import { 
  User, Bell, Shield, Globe, Save, Loader,
  CheckCircle, Mail, CreditCard, Key, AlertCircle, Smartphone,
  Code, Copy, Trash2, Plus, ChevronDown
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasLoaded = useRef(false);
  
  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';
  const restrictions = getUserRestrictions(user);

  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.displayName || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordSettings, setPasswordSettings] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [notificationSettings, setNotificationSettings] = useState({
    emailFactures: true, emailPaiements: true, emailContrats: true,
    emailRappels: false, pushPaiements: false, pushFactures: false
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    delaiPaiement: 30, notesDefaut: '', prefixe: 'FACT-', prochainNumero: 1, afficherTVA: true, tauxTVADefaut: 18
  });

  const [generalSettings, setGeneralSettings] = useState({
    langue: 'fr', devise: 'XOF', formatDate: 'DD/MM/YYYY', fuseauHoraire: 'Africa/Porto-Novo'
  });

  const [apiKey, setApiKey] = useState('');
  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ url: '', events: ['payment.received'] });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (hasLoaded.current || !user) return;
    const loadSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data) {
          if (data.company || data.phone || data.address) {
            setProfileSettings({ displayName: data.displayName || user.displayName || '', company: data.company || '', phone: data.phone || '', address: data.address || '' });
          }
          if (data.notificationSettings) setNotificationSettings(prev => ({...prev, ...data.notificationSettings}));
          if (data.invoiceSettings) setInvoiceSettings(prev => ({...prev, ...data.invoiceSettings}));
          if (data.generalSettings) setGeneralSettings(prev => ({...prev, ...data.generalSettings}));
          if (data.pushEnabled !== undefined) setPushEnabled(data.pushEnabled);
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.webhooks) setWebhooks(data.webhooks);
        }
        hasLoaded.current = true;
      } catch (e) { console.error('Erreur chargement:', e); }
      finally { setInitialLoading(false); }
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPushPermission = async () => {
    try {
      if (!('Notification' in window)) { toast.error('Notifications non supportées'); return; }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { toast.error('Permission refusée'); return; }
      try {
        const { getMessaging, getToken } = await import('firebase/messaging');
        const messaging = getMessaging(app);
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (vapidKey && vapidKey !== 'undefined') {
          const token = await getToken(messaging, { vapidKey });
          await updateDoc(doc(db, 'users', user.uid), { pushToken: token, pushEnabled: true, updatedAt: new Date().toISOString() });
        }
      } catch (e) { console.warn('Token:', e.message); }
      await updateDoc(doc(db, 'users', user.uid), { pushEnabled: true, updatedAt: new Date().toISOString() });
      setPushEnabled(true);
      toast.success('Notifications push activées !');
    } catch (error) { toast.error('Erreur'); }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try { await updateDoc(doc(db, 'users', user.uid), { displayName: profileSettings.displayName, company: profileSettings.company, phone: profileSettings.phone, address: profileSettings.address, updatedAt: new Date().toISOString() }); toast.success('Profil enregistré'); }
    catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try { await updateDoc(doc(db, 'users', user.uid), { notificationSettings, updatedAt: new Date().toISOString() }); toast.success('Notifications enregistrées'); }
    catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const handleSaveInvoiceSettings = async () => {
    setLoading(true);
    try { await updateDoc(doc(db, 'users', user.uid), { invoiceSettings, updatedAt: new Date().toISOString() }); toast.success('Facturation enregistrée'); }
    catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try { await updateDoc(doc(db, 'users', user.uid), { generalSettings, updatedAt: new Date().toISOString() }); toast.success('Préférences enregistrées'); }
    catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (isGoogle) { toast.error('Compte Google'); return; }
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) { toast.error('Mots de passe différents'); return; }
    if (passwordSettings.newPassword.length < 6) { toast.error('6 caractères minimum'); return; }
    setLoading(true);
    try { await updatePassword(auth.currentUser, passwordSettings.newPassword); toast.success('Mot de passe modifié'); setPasswordSettings({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (error) { toast.error(error.code === 'auth/requires-recent-login' ? 'Reconnectez-vous' : 'Erreur'); }
    finally { setLoading(false); }
  };

  const handleVerifyEmail = async () => { try { await sendEmailVerification(auth.currentUser); toast.success('Email envoyé'); } catch { toast.error('Erreur'); } };
  const handleGenerateApiKey = async () => { setApiLoading(true); try { const key = 'fa_' + Array.from({length: 64}, () => Math.random().toString(36)[2]).join(''); await updateDoc(doc(db, 'users', user.uid), { apiKey: key, apiKeyCreatedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); setApiKey(key); toast.success('Clé API générée !'); } catch { toast.error('Erreur'); } finally { setApiLoading(false); } };
  const handleCopyApiKey = () => { navigator.clipboard.writeText(apiKey); toast.success('Clé copiée !'); };
  const handleDeleteApiKey = async () => { if (!confirm('Révoquer cette clé ?')) return; try { await updateDoc(doc(db, 'users', user.uid), { apiKey: null, updatedAt: new Date().toISOString() }); setApiKey(''); toast.success('Clé révoquée'); } catch { toast.error('Erreur'); } };
  const handleAddWebhook = async () => { if (!webhookForm.url) { toast.error('URL requise'); return; } setApiLoading(true); try { const newWebhook = { id: 'wh_' + Date.now(), url: webhookForm.url, events: webhookForm.events, active: true, createdAt: new Date().toISOString() }; const updated = [...webhooks, newWebhook]; await updateDoc(doc(db, 'users', user.uid), { webhooks: updated, updatedAt: new Date().toISOString() }); setWebhooks(updated); setWebhookForm({ url: '', events: ['payment.received'] }); setShowWebhookForm(false); toast.success('Webhook ajouté !'); } catch { toast.error('Erreur'); } finally { setApiLoading(false); } };
  const handleDeleteWebhook = async (id) => { const updated = webhooks.filter(w => w.id !== id); await updateDoc(doc(db, 'users', user.uid), { webhooks: updated, updatedAt: new Date().toISOString() }); setWebhooks(updated); toast.success('Webhook supprimé'); };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'invoices', label: 'Facturation', icon: CreditCard },
    { id: 'api', label: 'API & Webhooks', icon: Code },
    { id: 'general', label: 'Général', icon: Globe }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  const devises = [
    { value: 'XOF', label: 'XOF' }, { value: 'XAF', label: 'XAF' }, { value: 'EUR', label: 'EUR' }, { value: 'USD', label: 'USD' },
    { value: 'GBP', label: 'GBP' }, { value: 'CAD', label: 'CAD' }, { value: 'NGN', label: 'NGN' }, { value: 'GHS', label: 'GHS' }
  ];
  const formatsDate = [
    { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' }, { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' },
    { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ' }, { value: 'DD MMMM YYYY', label: '31 Décembre 2026' }, { value: 'MMM DD, YYYY', label: 'Déc 31, 2026' }
  ];
  const fuseaux = [
    { value: 'Africa/Porto-Novo', label: 'Porto-Novo (GMT+1)' }, { value: 'Africa/Lagos', label: 'Lagos (GMT+1)' },
    { value: 'Africa/Abidjan', label: 'Abidjan (GMT)' }, { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' }, { value: 'UTC', label: 'UTC' }
  ];

  if (initialLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gérez vos préférences</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs Desktop */}
        <div className="hidden sm:block border-b border-gray-100">
          <nav className="flex overflow-x-auto -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tabs Mobile - Dropdown */}
        <div className="sm:hidden border-b border-gray-100">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900">
            <span className="flex items-center gap-2">
              {activeTabData && <activeTabData.icon size={16} />}
              {activeTabData?.label || 'Profil'}
            </span>
            <ChevronDown size={16} className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileMenuOpen && (
            <div className="border-t border-gray-100 bg-gray-50 p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          
          {/* PROFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="hidden sm:block"><h3 className="text-sm font-semibold text-gray-900 mb-1">Informations personnelles</h3><p className="text-xs text-gray-500">Ces informations apparaissent sur vos factures et contrats</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Nom complet</label><input type="text" value={profileSettings.displayName} onChange={e => setProfileSettings(prev => ({...prev, displayName: e.target.value}))} className={inputClass} /></div>
                <div><label className={labelClass}>Entreprise</label><input type="text" value={profileSettings.company} onChange={e => setProfileSettings(prev => ({...prev, company: e.target.value}))} className={inputClass} /></div>
                <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-3">
                  <div className="mb-3 sm:mb-0"><label className={labelClass}>Téléphone</label><input type="tel" value={profileSettings.phone} onChange={e => setProfileSettings(prev => ({...prev, phone: e.target.value}))} className={inputClass} /></div>
                  <div><label className={labelClass}>Adresse</label><input type="text" value={profileSettings.address} onChange={e => setProfileSettings(prev => ({...prev, address: e.target.value}))} className={inputClass} /></div>
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer</button>
            </div>
          )}

          {/* SÉCURITÉ */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="hidden sm:block"><h3 className="text-sm font-semibold text-gray-900 mb-1">Sécurité</h3><p className="text-xs text-gray-500">Mot de passe et vérification</p></div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-lg flex items-center justify-center ${user?.emailVerified ? 'bg-emerald-100' : 'bg-amber-100'}`}>{user?.emailVerified ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-600" />}</div><div><p className="text-sm font-medium">{user?.emailVerified ? 'Email vérifié' : 'Email non vérifié'}</p><p className="text-xs text-gray-500 break-all">{user?.email}</p></div></div>
                {!user?.emailVerified && !isGoogle && <button onClick={handleVerifyEmail} className="text-sm font-medium text-gray-900 hover:underline">Vérifier</button>}
              </div>
              {!isGoogle ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Changer le mot de passe</h4>
                  <input type="password" value={passwordSettings.currentPassword} onChange={e => setPasswordSettings(prev => ({...prev, currentPassword: e.target.value}))} className={inputClass} placeholder="Mot de passe actuel" />
                  <input type="password" value={passwordSettings.newPassword} onChange={e => setPasswordSettings(prev => ({...prev, newPassword: e.target.value}))} className={inputClass} placeholder="Nouveau mot de passe" />
                  <input type="password" value={passwordSettings.confirmPassword} onChange={e => setPasswordSettings(prev => ({...prev, confirmPassword: e.target.value}))} className={inputClass} placeholder="Confirmer" />
                  <button onClick={handleChangePassword} disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Key size={14} /> Mettre à jour</button>
                </div>
              ) : (<p className="text-xs text-gray-400">Géré par Google</p>)}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="hidden sm:block"><h3 className="text-sm font-semibold">Notifications</h3></div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3"><Smartphone size={18} /><div><p className="text-sm font-medium">Push</p><p className="text-xs text-gray-500">{pushEnabled ? 'Activées' : 'Désactivées'}</p></div></div>
                {!pushEnabled ? <button onClick={handleRequestPushPermission} className="text-sm font-medium hover:underline">Activer</button> : <CheckCircle size={18} className="text-emerald-500" />}
              </div>
              <div className="space-y-1">
                {[{ key: 'emailFactures', title: 'Factures créées' },{ key: 'emailPaiements', title: 'Paiements reçus' },{ key: 'emailContrats', title: 'Contrats créés' },{ key: 'emailRappels', title: 'Rappels' },{ key: 'pushPaiements', title: 'Push - Paiements' },{ key: 'pushFactures', title: 'Push - Factures' }].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50 rounded-xl">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{item.title}</p>
                    <button onClick={() => setNotificationSettings(prev => ({...prev, [item.key]: !prev[item.key]}))} className={`relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${notificationSettings[item.key] ? 'bg-gray-900' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow transition-transform ${notificationSettings[item.key] ? 'translate-x-4 sm:translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveNotifications} disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer</button>
            </div>
          )}

          {/* FACTURATION */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="hidden sm:block"><h3 className="text-sm font-semibold">Paramètres de facturation</h3></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Délai (j)</label><input type="number" value={invoiceSettings.delaiPaiement} onChange={e => setInvoiceSettings(prev => ({...prev, delaiPaiement: parseInt(e.target.value)||0}))} className={inputClass} /></div>
                <div><label className={labelClass}>TVA (%)</label><input type="number" value={invoiceSettings.tauxTVADefaut} onChange={e => setInvoiceSettings(prev => ({...prev, tauxTVADefaut: parseInt(e.target.value)||0}))} className={inputClass} /></div>
                <div><label className={labelClass}>Préfixe</label><input type="text" value={invoiceSettings.prefixe} onChange={e => setInvoiceSettings(prev => ({...prev, prefixe: e.target.value}))} className={inputClass} /></div>
                <div><label className={labelClass}>N° suivant</label><input type="number" value={invoiceSettings.prochainNumero} onChange={e => setInvoiceSettings(prev => ({...prev, prochainNumero: parseInt(e.target.value)||1}))} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Notes par défaut</label><textarea value={invoiceSettings.notesDefaut} onChange={e => setInvoiceSettings(prev => ({...prev, notesDefaut: e.target.value}))} className={inputClass} rows="2" /></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div><p className="text-xs sm:text-sm font-medium">Afficher la TVA</p></div><button onClick={() => setInvoiceSettings(prev => ({...prev, afficherTVA: !prev.afficherTVA}))} className={`relative w-10 h-5 sm:w-11 sm:h-6 rounded-full ${invoiceSettings.afficherTVA?'bg-gray-900':'bg-gray-200'}`}><span className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow transition-transform ${invoiceSettings.afficherTVA?'translate-x-4 sm:translate-x-5':''}`} /></button></div>
              <button onClick={handleSaveInvoiceSettings} disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer</button>
            </div>
          )}

          {/* API & WEBHOOKS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              {!restrictions.canUseApi ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Code size={24} className="text-gray-400"/></div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">API réservée au plan Business</h3>
                  <p className="text-xs text-gray-500 mb-4">Passez au plan Business pour accéder à l'API.</p>
                  <Link to="/subscription" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 inline-flex items-center gap-2">Voir les plans</Link>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Clé API</h3>
                    {apiKey ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-700 truncate select-all">{apiKey}</div>
                          <button onClick={handleCopyApiKey} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex-shrink-0"><Copy size={14} /></button>
                          <button onClick={handleDeleteApiKey} className="p-2 border border-red-200 rounded-xl hover:bg-red-50 text-red-500 flex-shrink-0"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={handleGenerateApiKey} disabled={apiLoading} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium">{apiLoading ? <Loader className="animate-spin" size={14} /> : <Key size={14} />} Générer une clé API</button>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">Webhooks</h3><button onClick={() => setShowWebhookForm(!showWebhookForm)} className="text-sm font-medium hover:underline flex items-center gap-1"><Plus size={14} /> Ajouter</button></div>
                    {showWebhookForm && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                        <div><label className={labelClass}>URL</label><input type="url" value={webhookForm.url} onChange={e => setWebhookForm(prev => ({...prev, url: e.target.value}))} className={inputClass} /></div>
                        <div className="flex gap-2"><button onClick={handleAddWebhook} className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs">Ajouter</button><button onClick={() => setShowWebhookForm(false)} className="px-3 py-1.5 text-xs">Annuler</button></div>
                      </div>
                    )}
                    {webhooks.map(w => (<div key={w.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"><p className="text-xs truncate flex-1">{w.url}</p><button onClick={() => handleDeleteWebhook(w.id)} className="text-red-400 ml-2 flex-shrink-0"><Trash2 size={14} /></button></div>))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* GÉNÉRAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="hidden sm:block"><h3 className="text-sm font-semibold">Préférences générales</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Langue</label><select value={generalSettings.langue} onChange={e => setGeneralSettings(prev => ({...prev, langue: e.target.value}))} className={inputClass}><option value="fr">Français</option></select></div>
                <div><label className={labelClass}>Devise</label><select value={generalSettings.devise} onChange={e => setGeneralSettings(prev => ({...prev, devise: e.target.value}))} className={inputClass}>{devises.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
                <div><label className={labelClass}>Format date</label><select value={generalSettings.formatDate} onChange={e => setGeneralSettings(prev => ({...prev, formatDate: e.target.value}))} className={inputClass}>{formatsDate.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                <div><label className={labelClass}>Fuseau horaire</label><select value={generalSettings.fuseauHoraire} onChange={e => setGeneralSettings(prev => ({...prev, fuseauHoraire: e.target.value}))} className={inputClass}>{fuseaux.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
              </div>
              <button onClick={handleSaveGeneralSettings} disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}