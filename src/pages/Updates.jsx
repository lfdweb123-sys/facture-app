import { Clock, Sparkles, Shield, Zap, FileText } from 'lucide-react';

export default function Updates() {
  const updates = [
    { date: 'Avril 2026', icon: Sparkles, title: 'Assistant IA amélioré', desc: 'Historique des conversations, support ChatGPT et Claude, génération automatique de factures et contrats.' },
    { date: 'Mars 2026', icon: Shield, title: 'Vérification d\'identité', desc: 'Soumission de documents (CIP, CNI, Passeport, RCCM) pour vérifier les comptes freelances et PME.' },
    { date: 'Février 2026', icon: Zap, title: 'Paiements en ligne', desc: 'Intégration FeexPay pour accepter Mobile Money, cartes bancaires et wallets.' },
    { date: 'Janvier 2026', icon: FileText, title: 'Lancement v1.0', desc: 'Création de factures PDF, contrats avec IA, portefeuille, retraits et abonnements.' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mises à jour</h1>
        <p className="text-xs text-gray-500 mt-0.5">Les dernières évolutions de Facture App</p>
      </div>
      <div className="space-y-4">
        {updates.map((u, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <u.icon size={20} className="text-gray-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1"><Clock size={11} />{u.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{u.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{u.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}