import { Code, Key, Shield, Zap, Server } from 'lucide-react';

export default function ApiDocumentation() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="text-xs text-gray-500 mt-0.5">Intégrez Facture App à vos outils</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-8">
        
        {/* Introduction */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Introduction</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            L'API Facture App permet d'automatiser la création de factures, la gestion des clients et le suivi des paiements. 
            Toutes les requêtes sont en HTTPS et utilisent l'authentification par clé API.
          </p>
        </div>

        {/* Authentification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900">Authentification</h2>
          </div>
          <p className="text-sm text-gray-500">Incluez votre clé API dans le header de chaque requête :</p>
          <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
            Authorization: Bearer YOUR_API_KEY
          </div>
          <p className="text-xs text-gray-400">Obtenez votre clé API dans Paramètres → Développeurs.</p>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900">Endpoints</h2>
          </div>

          {/* Créer une facture */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">POST</span>
              <code className="text-sm text-gray-900">/api/v1/invoices</code>
            </div>
            <p className="text-sm text-gray-500">Crée une nouvelle facture.</p>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
{`{
  "clientName": "Nom du client",
  "clientEmail": "client@email.com",
  "items": [
    {"description": "Prestation", "quantity": 1, "unitPrice": 50000, "tax": 18}
  ],
  "dueDate": "2026-05-23",
  "notes": "Paiement sous 30 jours"
}`}
            </div>
          </div>

          {/* Lister les factures */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
              <code className="text-sm text-gray-900">/api/v1/invoices</code>
            </div>
            <p className="text-sm text-gray-500">Récupère la liste de vos factures.</p>
          </div>

          {/* Récupérer une facture */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
              <code className="text-sm text-gray-900">/api/v1/invoices/{'{invoiceId}'}</code>
            </div>
            <p className="text-sm text-gray-500">Récupère les détails d'une facture spécifique.</p>
          </div>

          {/* Statut facture */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">PATCH</span>
              <code className="text-sm text-gray-900">/api/v1/invoices/{'{invoiceId}'}/status</code>
            </div>
            <p className="text-sm text-gray-500">Met à jour le statut d'une facture.</p>
          </div>

          {/* Webhooks */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">Webhooks</span>
            </div>
            <p className="text-sm text-gray-500">
              Recevez des notifications en temps réel quand une facture est payée. Configurez votre URL de callback dans les paramètres.
            </p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900">Sécurité</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• Toutes les requêtes doivent être en HTTPS</li>
            <li>• La clé API doit être gardée secrète</li>
            <li>• Limite de 1000 requêtes par heure par clé API</li>
            <li>• Les données sont chiffrées en transit (TLS 1.3)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}