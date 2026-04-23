import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Save, Camera, Shield, Calendar, Clock, CheckCircle } from 'lucide-react';
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
      await updateDoc(doc(db, 'users', user.uid), { ...formData, updatedAt: new Date().toISOString() });
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';
  const isEmail = !isGoogle;

  const getInitials = () => {
    if (user?.displayName) return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gérez vos informations personnelles</p>
      </div>

      {/* Carte identité */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-16 h-16 rounded-xl object-cover"/>
              ) : (
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{getInitials()}</span>
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 hover:bg-gray-50">
                <Camera size={12} className="text-gray-500"/>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{user?.displayName || user?.email?.split('@')[0]}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={13}/>{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isGoogle && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                    <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </span>
                )}
                {isEmail && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                    <Mail size={11}/>Email
                  </span>
                )}
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    <CheckCircle size={11}/>Vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                    <Shield size={11}/>Non vérifié
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Calendar size={14} className="text-gray-600"/></div>
              <div>
                <p className="text-xs text-gray-400">Inscrit le</p>
                <p className="text-sm font-medium text-gray-900">{format(new Date(user?.metadata?.creationTime || new Date()), 'dd MMM yyyy', { locale: fr })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Clock size={14} className="text-gray-600"/></div>
              <div>
                <p className="text-xs text-gray-400">Dernière connexion</p>
                <p className="text-sm font-medium text-gray-900">{format(new Date(user?.metadata?.lastSignInTime || new Date()), 'dd MMM à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations personnelles</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Nom complet</label><input type="text" value={formData.displayName} onChange={e=>setFormData({...formData,displayName:e.target.value})} className={inputClass}/></div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"/>
              {isGoogle && <p className="text-xs text-gray-400 mt-1">Géré par Google</p>}
            </div>
            <div><label className={labelClass}>Téléphone</label><input type="tel" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Entreprise</label><input type="text" value={formData.company} onChange={e=>setFormData({...formData,company:e.target.value})} className={inputClass}/></div>
          </div>
          <div><label className={labelClass}>Adresse</label><input type="text" value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>Bio</label><textarea value={formData.bio} onChange={e=>setFormData({...formData,bio:e.target.value})} className={inputClass} rows="3" placeholder="Quelques mots sur vous..."/></div>

          <div className="pt-3 border-t border-gray-100">
            <button type="submit" disabled={loading} className="bg-gray-900 text-white font-medium py-2.5 px-6 rounded-xl text-sm hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Enregistrement...</> : <><Save size={14}/> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sécurité</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {isGoogle ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              ) : (
                <Mail size={18} className="text-gray-600"/>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{isGoogle ? 'Connexion Google' : 'Connexion Email'}</p>
                <p className="text-xs text-gray-500">{isGoogle ? 'Compte lié à Google' : 'Email et mot de passe'}</p>
              </div>
            </div>
            {isGoogle ? <CheckCircle size={16} className="text-emerald-500"/> : <button className="text-sm text-gray-900 font-medium hover:underline">Changer mot de passe</button>}
          </div>
        </div>
      </div>
    </div>
  );
}