import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth, updatePassword, sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import { 
  User, 
  Bell, 
  Shield, 
  Globe,
  Save,
  Loader,
  CheckCircle,
  Mail,
  Smartphone,
  CreditCard,
  Key,
  X,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
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
    emailInvoices: true,
    emailPayments: true,
    emailReminders: false,
    pushPayments: true
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    defaultDueDays: 30,
    defaultNotes: '',
    prefix: 'FACT-',
    nextNumber: 1,
    showTax: true,
    defaultTaxRate: 18
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'invoices', label: 'Facturation', icon: CreditCard },
    { id: 'general', label: 'Général', icon: Globe }
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profileSettings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Paramètres enregistrés');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (isGoogle) {
      toast.error('Vous utilisez Google. Gérez votre mot de passe dans les paramètres Google.');
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
      toast.error('Erreur. Reconnectez-vous puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Email de vérification envoyé');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const settings = {
        profileSettings,
        notificationSettings,
        invoiceSettings,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'users', user.uid), { settings });
      toast.success('Tous les paramètres ont été enregistrés');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-500 text-sm mt-1">Gérez vos préférences</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
            Tout enregistrer
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            
            {/* Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Informations personnelles</h3>
                  <p className="text-sm text-gray-500">Ces informations apparaîtront sur vos factures et contrats</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nom complet</label>
                    <input
                      type="text"
                      value={profileSettings.displayName}
                      onChange={(e) => setProfileSettings({...profileSettings, displayName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Entreprise</label>
                    <input
                      type="text"
                      value={profileSettings.company}
                      onChange={(e) => setProfileSettings({...profileSettings, company: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Adresse</label>
                    <input
                      type="text"
                      value={profileSettings.address}
                      onChange={(e) => setProfileSettings({...profileSettings, address: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Sécurité du compte</h3>
                  <p className="text-sm text-gray-500">Gérez votre mot de passe et la vérification</p>
                </div>

                {/* Vérification email */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.emailVerified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        {user?.emailVerified ? (
                          <CheckCircle size={20} className="text-emerald-600" />
                        ) : (
                          <AlertCircle size={20} className="text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {user?.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    {!user?.emailVerified && !isGoogle && (
                      <button onClick={handleVerifyEmail} className="text-sm font-medium text-gray-900 hover:underline">
                        Vérifier
                      </button>
                    )}
                    {isGoogle && (
                      <span className="text-xs text-gray-400">Géré par Google</span>
                    )}
                  </div>
                </div>

                {/* Mot de passe */}
                {!isGoogle ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">Changer le mot de passe</h4>
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={passwordSettings.currentPassword}
                        onChange={(e) => setPasswordSettings({...passwordSettings, currentPassword: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        placeholder="Mot de passe actuel"
                      />
                      <input
                        type="password"
                        value={passwordSettings.newPassword}
                        onChange={(e) => setPasswordSettings({...passwordSettings, newPassword: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        placeholder="Nouveau mot de passe"
                      />
                      <input
                        type="password"
                        value={passwordSettings.confirmPassword}
                        onChange={(e) => setPasswordSettings({...passwordSettings, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        placeholder="Confirmer le mot de passe"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !passwordSettings.newPassword}
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Key size={16} />
                      Mettre à jour
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Connexion Google</p>
                        <p className="text-xs text-gray-500">Gérez votre mot de passe dans les paramètres de votre compte Google</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h3>
                  <p className="text-sm text-gray-500">Choisissez comment vous souhaitez être notifié</p>
                </div>
                
                <div className="space-y-1">
                  {[
                    { key: 'emailInvoices', title: 'Nouvelles factures', desc: 'Email quand vous créez une facture' },
                    { key: 'emailPayments', title: 'Paiements reçus', desc: 'Email quand un client paie une facture' },
                    { key: 'emailReminders', title: 'Rappels d\'échéance', desc: 'Email avant la date d\'échéance d\'une facture' },
                    { key: 'pushPayments', title: 'Notifications push', desc: 'Notifications dans le navigateur pour les paiements' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: !notificationSettings[item.key]
                        })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          notificationSettings[item.key] ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notificationSettings[item.key] ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facturation */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Paramètres de facturation</h3>
                  <p className="text-sm text-gray-500">Configuration par défaut pour vos factures</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Délai de paiement (jours)</label>
                    <input
                      type="number"
                      value={invoiceSettings.defaultDueDays}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultDueDays: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      min="0"
                      max="90"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Taux de TVA par défaut (%)</label>
                    <input
                      type="number"
                      value={invoiceSettings.defaultTaxRate}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultTaxRate: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Préfixe facture</label>
                    <input
                      type="text"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, prefix: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Prochain numéro</label>
                    <input
                      type="number"
                      value={invoiceSettings.nextNumber}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, nextNumber: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Notes par défaut</label>
                  <textarea
                    value={invoiceSettings.defaultNotes}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultNotes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                    rows="2"
                    placeholder="Ex: Paiement sous 30 jours par virement bancaire"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Afficher la TVA</p>
                    <p className="text-xs text-gray-500">Inclure le détail de la TVA sur les factures</p>
                  </div>
                  <button
                    onClick={() => setInvoiceSettings({...invoiceSettings, showTax: !invoiceSettings.showTax})}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      invoiceSettings.showTax ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      invoiceSettings.showTax ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Général */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Préférences générales</h3>
                  <p className="text-sm text-gray-500">Langue, devise et format de date</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Langue</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Devise</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                      <option value="XOF">XOF - Franc CFA</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Format de date</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                      <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                      <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                      <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Fuseau horaire</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                      <option value="Africa/Porto-Novo">Afrique/Porto-Novo (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Informations compte</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">ID utilisateur</p>
                      <p className="text-gray-900 font-mono text-xs truncate">{user?.uid}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Méthode de connexion</p>
                      <p className="text-gray-900">{isGoogle ? 'Google' : 'Email'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}