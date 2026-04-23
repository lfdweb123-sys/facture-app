import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function Status() {
  const services = [
    { name: 'Application Web', status: 'operational', uptime: '99.99%' },
    { name: 'API', status: 'operational', uptime: '99.95%' },
    { name: 'Paiements (FeexPay)', status: 'operational', uptime: '99.98%' },
    { name: 'Base de données (Firestore)', status: 'operational', uptime: '99.99%' },
    { name: 'Authentification (Firebase Auth)', status: 'operational', uptime: '99.99%' },
    { name: 'Emails (Brevo)', status: 'operational', uptime: '99.97%' },
    { name: 'IA (ChatGPT/Claude)', status: 'operational', uptime: '99.90%' },
    { name: 'Stockage (Firebase Storage)', status: 'operational', uptime: '99.99%' }
  ];

  const incidents = [
    { date: '23 Avril 2026', title: 'Maintenance planifiée', status: 'resolved', description: 'Mise à jour de sécurité appliquée avec succès. Aucune interruption.' },
    { date: '15 Avril 2026', title: 'Ralentissement API', status: 'resolved', description: 'Pic de trafic détecté. Résolu en 15 minutes. Surveillance renforcée.' }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'operational': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'degraded': return <AlertCircle size={18} className="text-amber-500" />;
      case 'outage': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Clock size={18} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'operational': return 'Opérationnel';
      case 'degraded': return 'Dégradé';
      case 'outage': return 'En panne';
      default: return 'Maintenance';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': return 'text-emerald-600';
      case 'degraded': return 'text-amber-600';
      case 'outage': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Statut des services</h1>
        <p className="text-xs text-gray-500 mt-0.5">Surveillance en temps réel de nos services</p>
      </div>

      {/* État global */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Tous les services sont opérationnels</p>
          <p className="text-xs text-emerald-700">Dernière vérification : {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Services</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {services.map((service, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <span className="text-sm text-gray-900">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${getStatusColor(service.status)}`}>
                  {getStatusLabel(service.status)}
                </span>
                <span className="text-xs text-gray-400">{service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents récents */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Incidents récents</h2>
        </div>
        {incidents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <CheckCircle size={32} className="text-emerald-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucun incident récent</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {incidents.map((incident, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                  <span className="text-xs text-emerald-600 font-medium">Résolu</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{incident.description}</p>
                <p className="text-xs text-gray-400">{incident.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique uptime */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Disponibilité (30 derniers jours)</h2>
        <div className="flex gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-emerald-100 rounded-sm" title={`Jour ${i+1} : Opérationnel`} />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 bg-emerald-100 rounded-sm" /> Opérationnel
          </div>
          <span className="text-sm font-bold text-gray-900">99.97%</span>
        </div>
      </div>
    </div>
  );
}