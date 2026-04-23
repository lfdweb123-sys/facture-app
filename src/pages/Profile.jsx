import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Save, 
  Camera,
  Shield,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Déterminer la méthode de connexion
  const getAuthMethod = () => {
    if (!user) return 'email';
    const providerData = user.providerData?.[0];
    return providerData?.providerId || 'password';
  };

  const authMethod = getAuthMethod();
  const isGoogle = authMethod === 'google.com';
  const isEmail = authMethod === 'password' || !user?.providerData?.[0];

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  // Date d'inscription formatée
  const getCreationDate = () => {
    const createdAt = user?.metadata?.creationTime || user?.createdAt;
    return createdAt || new Date().toISOString();
  };

  // Dernière connexion
  const getLastLogin = () => {
    return user?.metadata?.lastSignInTime || new Date().toISOString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1 text-sm">Gérez vos informations personnelles</p>
        </div>

        {/* Carte d'identité */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Bannière */}
          <div className="h-24 bg-gradient-to-r from-gray-900 to-gray-700 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-xl border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-900 rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
                <button className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-all">
                  <Camera size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Infos */}
          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                  <Mail size={14} />
                  {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Badge méthode de connexion */}
                {isGoogle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </span>
                )}
                {isEmail && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                    <Mail size={12} />
                    Email
                  </span>
                )}
                {user?.emailVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    <CheckCircle size={12} />
                    Vérifié
                  </span>
                )}
                {!user?.emailVerified && isEmail && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                    <Shield size={12} />
                    Non vérifié
                  </span>
                )}
              </div>
            </div>

            {/* Stats dates */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Inscrit le</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(getCreationDate()), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dernière connexion</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(getLastLogin()), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder={isGoogle ? user?.displayName || 'Votre nom' : 'Votre nom complet'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                {isGoogle && (
                  <p className="text-xs text-gray-400 mt-1">Email géré par Google</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="+229 97 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Entreprise
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="Votre entreprise"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="Votre adresse"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                rows="3"
                placeholder="Quelques mots sur vous..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gray-900 text-white font-medium py-3 px-8 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Méthode de connexion */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {isGoogle ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <Mail size={20} className="text-gray-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isGoogle ? 'Connexion via Google' : 'Connexion par email'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isGoogle 
                      ? 'Votre compte est lié à Google. La connexion se fait via votre compte Google.'
                      : 'Vous vous connectez avec votre adresse email et mot de passe.'}
                  </p>
                </div>
              </div>
              {isGoogle ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <button className="text-sm text-gray-900 font-medium hover:underline">
                  Changer mot de passe
                </button>
              )}
            </div>

            {user?.emailVerified && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Email vérifié</p>
                    <p className="text-xs text-emerald-700">Votre adresse email a été confirmée</p>
                  </div>
                </div>
              </div>
            )}

            {!user?.emailVerified && isEmail && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Email non vérifié</p>
                    <p className="text-xs text-amber-700">Vérifiez votre email pour sécuriser votre compte</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-amber-900 hover:underline">
                  Renvoyer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}