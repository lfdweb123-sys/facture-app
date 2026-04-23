import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk';
import '@feexpay/react-sdk/style.css';
import { CheckCircle, Shield, Zap, Crown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Subscription() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      period: 'mois',
      features: ['5 factures/mois', '2 contrats', 'Paiements limités', 'Assistant IA basique', 'Support email'],
      icon: Zap,
      color: 'border-gray-200',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9999,
      period: 'mois',
      features: ['Factures illimitées', 'Contrats illimités', 'Paiements illimités', 'Assistant IA complet', 'Support prioritaire', 'Retraits inclus'],
      icon: Crown,
      color: 'border-gray-900 bg-gray-50',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 24999,
      period: 'mois',
      features: ['Tout en Pro', 'Multi-utilisateurs (5)', 'API dédiée', 'Personnalisation', 'Support dédié 24/7', 'Formation incluse'],
      icon: Shield,
      color: 'border-gray-200',
      popular: false
    }
  ];

  const currentPlan = user?.subscription?.plan || 'free';

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.price > 0) {
      setShowPayment(true);
    } else {
      handleFreeSubscription();
    }
  };

  const handleFreeSubscription = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        subscription: { plan: 'free', since: new Date().toISOString(), status: 'active' },
        updatedAt: new Date().toISOString()
      });
      toast.success('Abonnement gratuit activé !');
      setShowPayment(false);
      setSelectedPlan(null);
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  const handlePaymentSuccess = async (response) => {
    if (response.status === 'success' && selectedPlan) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          subscription: {
            plan: selectedPlan.id,
            price: selectedPlan.price,
            since: new Date().toISOString(),
            status: 'active',
            transactionRef: response.transaction_id
          },
          updatedAt: new Date().toISOString()
        });
        toast.success(`Abonnement ${selectedPlan.name} activé !`);
        setShowPayment(false);
        setSelectedPlan(null);
      } catch { toast.error('Erreur activation abonnement'); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white rounded-lg border border-gray-200"><ArrowLeft size={16}/></Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Abonnement</h1>
            <p className="text-sm text-gray-500">
              Plan actuel : <span className="font-semibold text-gray-900 capitalize">{currentPlan}</span>
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <div key={plan.id} className={`bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col relative ${plan.popular ? 'shadow-md' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold">Recommandé</div>
                )}
                <div className={`mt-2 ${plan.popular ? 'mt-4' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-gray-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price.toLocaleString()} XOF</span>
                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent || loading}
                  className={`mt-auto w-full py-3 rounded-xl font-medium text-sm transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : plan.popular
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'border-2 border-gray-300 text-gray-700 hover:border-gray-900'
                  } disabled:opacity-50`}
                >
                  {isCurrent ? 'Plan actuel' : loading ? 'Activation...' : `Choisir ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal paiement */}
        {showPayment && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPayment(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Payer l'abonnement {selectedPlan.name}</h3>
                <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Montant</span>
                    <span className="text-xl font-bold text-gray-900">{selectedPlan.price.toLocaleString()} XOF</span>
                  </div>
                </div>

                <FeexPayProvider>
                  <FeexPayButton 
                    amount={selectedPlan.price}
                    description={`Abonnement ${selectedPlan.name} - Facture App`}
                    token={import.meta.env.VITE_FEEXPAY_TOKEN}
                    id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
                    customId={`SUB-${user.uid}-${Date.now()}`}
                    callback_info={{
                      email: user.email,
                      fullname: user.displayName || '',
                      plan: selectedPlan.id
                    }}
                    mode="LIVE"
                    currency="XOF"
                    callback={handlePaymentSuccess}
                    className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all text-center"
                  />
                </FeexPayProvider>

                <p className="text-xs text-gray-400 text-center">Paiement sécurisé par FeexPay</p>
              </div>
            </div>
          </div>
        )}

        {/* Comparaison */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparaison des fonctionnalités</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-gray-500 font-medium">Fonctionnalité</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Gratuit</th>
                  <th className="text-center py-3 text-gray-900 font-semibold bg-gray-50">Pro</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Business</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Factures', free: '5/mois', pro: 'Illimitées', business: 'Illimitées' },
                  { feature: 'Contrats', free: '2', pro: 'Illimités', business: 'Illimités' },
                  { feature: 'Assistant IA', free: 'Basique', pro: 'Complet', business: 'Complet +' },
                  { feature: 'Utilisateurs', free: '1', pro: '1', business: '5' },
                  { feature: 'Support', free: 'Email', pro: 'Prioritaire', business: 'Dédié 24/7' },
                  { feature: 'Retraits', free: 'Non', pro: 'Oui', business: 'Oui' },
                  { feature: 'API', free: 'Non', pro: 'Non', business: 'Oui' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 text-gray-700">{row.feature}</td>
                    <td className="text-center py-3 text-gray-500">{row.free}</td>
                    <td className="text-center py-3 text-gray-900 font-medium bg-gray-50">{row.pro}</td>
                    <td className="text-center py-3 text-gray-500">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}