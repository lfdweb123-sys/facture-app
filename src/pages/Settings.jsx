import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, messaging } from '../services/firebase';
import { getAuth, updatePassword, sendEmailVerification } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { 
  User, Bell, Shield, Globe, Save, Loader,
  CheckCircle, Mail, CreditCard, Key, AlertCircle, Smartphone
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [pushEnabled, setPushEnabled] = useState(false);
  
  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';

  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.displayName || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailFactures: true,
    emailPaiements: true,
    emailContrats: true,
    emailRappels: false,
    pushPaiements: false,
    pushFactures: false
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    delaiPaiement: 30,
    notesDefaut: '',
    prefixe: 'FACT-',
    prochainNumero: 1,
    afficherTVA: true,
    tauxTVADefaut: 18
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data?.settings?.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
        if (data?.settings?.invoiceSettings) setInvoiceSettings(data.settings.invoiceSettings);
        if (data?.settings?.profileSettings) setProfileSettings(prev => ({...prev, ...data.settings.profileSettings}));
      } catch (e) {}
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPushPermission = async () => {
    if (!messaging) {
      toast.error('Notifications push non supportées sur ce navigateur');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          toast.error('Clé VAPID non configurée');
          return;
        }
        
        const token = await getToken(messaging, { vapidKey });
        
        await updateDoc(doc(db, 'users', user.uid), {
          pushToken: token,
          updatedAt: new Date().toISOString()
        });

        setPushEnabled(true);
        setNotificationSettings(prev => ({...prev, pushPaiements: true, pushFactures: true}));
        toast.success('Notifications push activées !');
      } else {
        toast.error('Permission refusée');
      }
    } catch (error) {
      console.error('Erreur push:', error);
      toast.error('Erreur lors de l\'activation. Vérifiez la clé VAPID.');
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profileSettings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Profil enregistré');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (isGoogle) {
      toast.error('Compte Google : gérez votre mot de passe dans les paramètres Google');
      return;
    }
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordSettings.newPassword.length < 6) {
      toast.error('6 caractères minimum');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, passwordSettings.newPassword);
      toast.success('Mot de passe modifié');
      setPasswordSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Veuillez vous reconnecter avant de changer votre mot de passe');
      } else {
        toast.error('Erreur lors du changement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Email de vérification envoyé à ' + user.email);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notificationSettings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Préférences de notifications enregistrées');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoiceSettings = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        invoiceSettings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Paramètres de facturation enregistrés');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'invoices', label: 'Facturation', icon: CreditCard },
    { id: 'general', label: 'Général', icon: Globe }
  ];

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gérez vos préférences</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 sm:p-6">
          
          {/* Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Informations personnelles</h3>
                <p className="text-xs text-gray-500">Ces informations apparaissent sur vos factures et contrats</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Nom complet</label><input type="text" value={profileSettings.displayName} onChange={e => setProfileSettings({...profileSettings, displayName: e.target.value})} className={inputClass} /></div>
                <div><label className={labelClass}>Entreprise</label><input type="text" value={profileSettings.company} onChange={e => setProfileSettings({...profileSettings, company: e.target.value})} className={inputClass} /></div>
                <div><label className={labelClass}>Téléphone</label><input type="tel" value={profileSettings.phone} onChange={e => setProfileSettings({...profileSettings, phone: e.target.value})} className={inputClass} /></div>
                <div><label className={labelClass}>Adresse</label><input type="text" value={profileSettings.address} onChange={e => setProfileSettings({...profileSettings, address: e.target.value})} className={inputClass} /></div>
              </div>
              <button onClick={handleSaveProfile} disabled={loading}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer
              </button>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Sécurité du compte</h3>
                <p className="text-xs text-gray-500">Gérez votre mot de passe et la vérification</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${user?.emailVerified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {user?.emailVerified ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.emailVerified ? 'Email vérifié' : 'Email non vérifié'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  {!user?.emailVerified && !isGoogle && (
                    <button onClick={handleVerifyEmail} className="text-sm font-medium text-gray-900 hover:underline">Vérifier</button>
                  )}
                  {isGoogle && <span className="text-xs text-gray-400">Géré par Google</span>}
                </div>
              </div>
              {!isGoogle ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Changer le mot de passe</h4>
                  <div className="space-y-3">
                    <input type="password" value={passwordSettings.currentPassword} onChange={e => setPasswordSettings({...passwordSettings, currentPassword: e.target.value})} className={inputClass} placeholder="Mot de passe actuel" />
                    <input type="password" value={passwordSettings.newPassword} onChange={e => setPasswordSettings({...passwordSettings, newPassword: e.target.value})} className={inputClass} placeholder="Nouveau mot de passe (6 caractères min)" />
                    <input type="password" value={passwordSettings.confirmPassword} onChange={e => setPasswordSettings({...passwordSettings, confirmPassword: e.target.value})} className={inputClass} placeholder="Confirmer le nouveau mot de passe" />
                  </div>
                  <button onClick={handleChangePassword} disabled={loading || !passwordSettings.newPassword}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
                    <Key size={14} /> Mettre à jour le mot de passe
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Connexion Google</p>
                    <p className="text-xs text-gray-500">Gérez votre mot de passe dans les paramètres Google</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Préférences de notifications</h3>
                <p className="text-xs text-gray-500">Choisissez comment recevoir vos alertes</p>
              </div>

              {/* Push */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifications push</p>
                      <p className="text-xs text-gray-500">{pushEnabled ? 'Activées' : 'Recevez des alertes en temps réel'}</p>
                    </div>
                  </div>
                  {!pushEnabled ? (
                    <button onClick={handleRequestPushPermission} className="text-sm font-medium text-gray-900 hover:underline">Activer</button>
                  ) : (
                    <CheckCircle size={18} className="text-emerald-500" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { key: 'emailFactures', title: 'Factures créées', desc: 'Email quand vous créez une facture' },
                  { key: 'emailPaiements', title: 'Paiements reçus', desc: 'Email quand un client paie' },
                  { key: 'emailContrats', title: 'Contrats créés', desc: 'Email quand vous générez un contrat' },
                  { key: 'emailRappels', title: 'Rappels d\'échéance', desc: 'Email avant la date d\'échéance' },
                  { key: 'pushPaiements', title: 'Push - Paiements', desc: 'Alerte immédiate pour les paiements' },
                  { key: 'pushFactures', title: 'Push - Factures', desc: 'Alerte pour nouvelles factures' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, [item.key]: !notificationSettings[item.key]})}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notificationSettings[item.key] ? 'bg-gray-900' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationSettings[item.key] ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveNotifications} disabled={loading}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer les notifications
              </button>
            </div>
          )}

          {/* Facturation */}
          {activeTab === 'invoices' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Paramètres de facturation</h3>
                <p className="text-xs text-gray-500">Configuration par défaut pour vos factures</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Délai de paiement (jours)</label><input type="number" value={invoiceSettings.delaiPaiement} onChange={e => setInvoiceSettings({...invoiceSettings, delaiPaiement: parseInt(e.target.value) || 0})} className={inputClass} min="0" max="90" /></div>
                <div><label className={labelClass}>Taux TVA par défaut (%)</label><input type="number" value={invoiceSettings.tauxTVADefaut} onChange={e => setInvoiceSettings({...invoiceSettings, tauxTVADefaut: parseInt(e.target.value) || 0})} className={inputClass} min="0" max="100" /></div>
                <div><label className={labelClass}>Préfixe facture</label><input type="text" value={invoiceSettings.prefixe} onChange={e => setInvoiceSettings({...invoiceSettings, prefixe: e.target.value})} className={inputClass} /></div>
                <div><label className={labelClass}>Prochain numéro</label><input type="number" value={invoiceSettings.prochainNumero} onChange={e => setInvoiceSettings({...invoiceSettings, prochainNumero: parseInt(e.target.value) || 1})} className={inputClass} min="1" /></div>
              </div>
              <div><label className={labelClass}>Notes par défaut</label><textarea value={invoiceSettings.notesDefaut} onChange={e => setInvoiceSettings({...invoiceSettings, notesDefaut: e.target.value})} className={inputClass} rows="2" /></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div><p className="text-sm font-medium text-gray-900">Afficher la TVA</p></div>
                <button onClick={() => setInvoiceSettings({...invoiceSettings, afficherTVA: !invoiceSettings.afficherTVA})}
                  className={`relative w-11 h-6 rounded-full transition-colors ${invoiceSettings.afficherTVA ? 'bg-gray-900' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${invoiceSettings.afficherTVA ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <button onClick={handleSaveInvoiceSettings} disabled={loading}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer
              </button>
            </div>
          )}

          {/* Général */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div><h3 className="text-sm font-semibold text-gray-900 mb-1">Préférences générales</h3></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Langue</label><select className={inputClass} defaultValue="fr"><option value="fr">Français</option></select></div>
                <div><label className={labelClass}>Devise</label><select className={inputClass} defaultValue="XOF"><option value="XOF">XOF - Franc CFA</option></select></div>
                <div><label className={labelClass}>Format de date</label><select className={inputClass} defaultValue="DD/MM/YYYY"><option value="DD/MM/YYYY">JJ/MM/AAAA</option></select></div>
                <div><label className={labelClass}>Fuseau horaire</label><select className={inputClass} defaultValue="Africa/Porto-Novo"><option value="Africa/Porto-Novo">Afrique/Porto-Novo (GMT+1)</option></select></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-sm">
                <div className="grid sm:grid-cols-2 gap-3"><div><p className="text-gray-500">ID</p><p className="text-gray-900 font-mono text-xs truncate">{user?.uid}</p></div><div><p className="text-gray-500">Connexion</p><p className="text-gray-900">{isGoogle ? 'Google' : 'Email'}</p></div></div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}