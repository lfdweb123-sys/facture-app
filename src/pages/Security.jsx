import { Shield, Lock, Eye, UserCheck, Key, Server } from 'lucide-react';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="text-xs text-gray-500 mt-0.5">Comment nous protégeons vos données</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-8">
        {[
          { icon: Shield, title: 'Protection des données', text: 'Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Vos informations personnelles et documents de vérification sont stockés de manière sécurisée sur Firebase, certifié SOC 2, ISO 27001.' },
          { icon: Lock, title: 'Paiements sécurisés', text: 'Les transactions sont traitées par FeexPay, conforme aux normes PCI DSS. Aucune donnée bancaire n\'est stockée sur nos serveurs. Chaque paiement est authentifié et traçable.' },
          { icon: Eye, title: 'Confidentialité', text: 'Vos données ne sont jamais partagées avec des tiers. Seuls vous et les destinataires de vos factures ont accès aux informations que vous choisissez de partager.' },
          { icon: UserCheck, title: 'Vérification d\'identité', text: 'Les documents soumis pour vérification sont chiffrés et accessibles uniquement par notre équipe de conformité. Ils sont supprimés après validation.' },
          { icon: Key, title: 'Authentification', text: 'Connexion sécurisée par email/mot de passe ou Google OAuth 2.0. Sessions chiffrées et possibilité de déconnexion à distance.' },
          { icon: Server, title: 'Infrastructure', text: 'Hébergé sur Vercel et Firebase (Google Cloud). Protection DDoS, pare-feu applicatif, monitoring 24/7 et sauvegardes automatiques.' }
        ].map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <item.icon size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}