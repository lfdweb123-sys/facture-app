import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk';
import '@feexpay/react-sdk/style.css';
import { CheckCircle, Shield, Zap, Crown, ArrowLeft, X, TrendingUp } from 'lucide-react';
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
      popular: false,
      accentColor: '#00A550',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9999,
      period: 'mois',
      features: ['Factures illimitées', 'Contrats illimités', 'Paiements illimités', 'Assistant IA complet', 'Support prioritaire', 'Retraits inclus'],
      icon: Crown,
      popular: true,
      accentColor: '#FF6B00',
    },
    {
      id: 'business',
      name: 'Business',
      price: 24999,
      period: 'mois',
      features: ['Tout en Pro', 'Multi-utilisateurs (5)', 'API dédiée', 'Personnalisation', 'Support dédié 24/7', 'Formation incluse'],
      icon: Shield,
      popular: false,
      accentColor: '#9B00E8',
    },
  ];

  const currentPlan = user?.subscription?.plan || 'free';

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.price > 0) setShowPayment(true);
    else handleFreeSubscription();
  };

  const handleFreeSubscription = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        subscription: { plan: 'free', since: new Date().toISOString(), status: 'active' },
        updatedAt: new Date().toISOString(),
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
            transactionRef: response.transaction_id,
          },
          updatedAt: new Date().toISOString(),
        });
        toast.success(`Abonnement ${selectedPlan.name} activé !`);
        setShowPayment(false);
        setSelectedPlan(null);
      } catch { toast.error('Erreur activation abonnement'); }
    }
  };

  const compareRows = [
    { feature: 'Factures',      free: '5/mois',   pro: 'Illimitées', business: 'Illimitées' },
    { feature: 'Contrats',      free: '2',         pro: 'Illimités',  business: 'Illimités'  },
    { feature: 'Assistant IA',  free: 'Basique',   pro: 'Complet',    business: 'Complet +'  },
    { feature: 'Utilisateurs',  free: '1',         pro: '1',          business: '5'          },
    { feature: 'Support',       free: 'Email',     pro: 'Prioritaire',business: 'Dédié 24/7' },
    { feature: 'Retraits',      free: '✗',         pro: '✓',          business: '✓'          },
    { feature: 'API',           free: '✗',         pro: '✗',          business: '✓'          },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif", color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sub-plan-card { transition: all .25s; }
        .sub-plan-card:hover { transform: translateY(-3px); box-shadow: 0 16px 52px rgba(0,0,0,.1); }
        .sub-btn-outline:hover { border-color: #999 !important; color: #111 !important; }
        .sub-btn-gold:hover { box-shadow: 0 10px 36px rgba(255,107,0,.45) !important; transform: translateY(-1px); }
        .sub-tr:hover td { background: #FAFAFA; }
        @media(max-width: 760px) {
          .sub-plans-grid { grid-template-columns: 1fr !important; max-width: 400px; margin-left: auto; margin-right: auto; }
          .sub-compare-table th:nth-child(3), .sub-compare-table th:nth-child(4),
          .sub-compare-table td:nth-child(3), .sub-compare-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <Link to="/dashboard" style={{
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff', border: '1.5px solid #E5E5E5', borderRadius: 10,
            color: '#555', textDecoration: 'none', flexShrink: 0, transition: 'all .2s',
          }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.02em' }}>Abonnement</h1>
            <p style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
              Plan actuel :{' '}
              <span style={{ fontWeight: 700, color: '#FF6B00', textTransform: 'capitalize' }}>{currentPlan}</span>
            </p>
          </div>
        </div>

        {/* ── SECTION TAG ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
            <TrendingUp size={11} /> Choisissez votre plan
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 10 }}>
            Commencez gratuitement,<br />évoluez à votre rythme
          </h2>
          <p style={{ fontSize: 14, color: '#888', maxWidth: 360, margin: '0 auto' }}>Sans carte bancaire requise pour démarrer.</p>
        </div>

        {/* ── PLANS GRID ── */}
        <div className="sub-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 40 }}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className="sub-plan-card"
                style={{
                  background: '#fff',
                  border: plan.popular ? `2px solid #FF6B00` : '1.5px solid #EBEBEB',
                  borderRadius: 22,
                  padding: '36px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 12px 52px rgba(255,107,0,.13)' : '0 2px 12px rgba(0,0,0,.04)',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg,#FF6B00,#FFAA00)',
                    color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '4px 16px', borderRadius: 100,
                    letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>⚡ Le plus populaire</div>
                )}

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${plan.accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={19} style={{ color: plan.accentColor }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.09em' }}>Plan</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>{plan.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 34, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.02em' }}>
                    {plan.price === 0 ? '0' : plan.price.toLocaleString()} XOF
                  </span>
                  <span style={{ fontSize: 13, color: '#aaa', marginLeft: 4 }}>/ {plan.period}</span>
                </div>

                <div style={{ height: 1, background: '#F0F0F0', marginBottom: 22 }} />

                {/* Features */}
                <div style={{ flex: 1, marginBottom: 28 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#555', marginBottom: 12 }}>
                      <CheckCircle size={13} style={{ color: plan.accentColor, flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{ textAlign: 'center', padding: '12px 20px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#00A550', fontSize: 13, fontWeight: 700 }}>
                    ✓ Plan actuel
                  </div>
                ) : plan.popular ? (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading}
                    className="sub-btn-gold"
                    style={{ width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 20px rgba(255,107,0,.3)', transition: 'all .25s' }}
                  >
                    {loading && selectedPlan?.id === plan.id ? 'Activation…' : `Choisir ${plan.name}`}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading}
                    className="sub-btn-outline"
                    style={{ width: '100%', padding: '13px 20px', borderRadius: 12, border: '1.5px solid #DDD', background: 'transparent', color: '#555', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}
                  >
                    {loading && selectedPlan?.id === plan.id ? 'Activation…' : `Choisir ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── COMPARISON TABLE ── */}
        <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 20, padding: '28px', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>
            <Shield size={11} /> Comparaison des fonctionnalités
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sub-compare-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px 14px 0', color: '#999', fontWeight: 600, borderBottom: '1px solid #F0F0F0', width: '35%' }}>Fonctionnalité</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px 14px', color: '#999', fontWeight: 600, borderBottom: '1px solid #F0F0F0' }}>Gratuit</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px 14px', color: '#FF6B00', fontWeight: 800, borderBottom: '2px solid #FF6B00', background: '#FFF8F3' }}>Pro ⚡</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px 14px', color: '#999', fontWeight: 600, borderBottom: '1px solid #F0F0F0' }}>Business</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={i} className="sub-tr" style={{ borderBottom: i < compareRows.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <td style={{ padding: '13px 0', color: '#444', fontWeight: 500 }}>{row.feature}</td>
                    <td style={{ textAlign: 'center', padding: '13px 12px', color: '#888' }}>{row.free}</td>
                    <td style={{ textAlign: 'center', padding: '13px 12px', color: '#FF6B00', fontWeight: 700, background: '#FFF8F3' }}>{row.pro}</td>
                    <td style={{ textAlign: 'center', padding: '13px 12px', color: '#888' }}>{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── PAYMENT MODAL ── */}
      {showPayment && selectedPlan && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPayment(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, boxShadow: '0 32px 90px rgba(0,0,0,.2)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 2 }}>Paiement</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Abonnement {selectedPlan.name}</div>
              </div>
              <button onClick={() => setShowPayment(false)} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid #EEE', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24 }}>
              {/* Summary */}
              <div style={{ background: '#F7F8FC', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#888' }}>Plan</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{selectedPlan.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#888' }}>Montant</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#FF6B00', letterSpacing: '-.02em' }}>{selectedPlan.price.toLocaleString()} XOF</span>
                </div>
                <div style={{ height: 1, background: '#EBEBEB', margin: '12px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#00A550' }}>
                  <CheckCircle size={12} /> Récurrent · {selectedPlan.period}
                </div>
              </div>

              {/* FeexPay */}
              <FeexPayProvider>
                <FeexPayButton
                  amount={selectedPlan.price}
                  description={`Abonnement ${selectedPlan.name} - Facture App`}
                  token={import.meta.env.VITE_FEEXPAY_TOKEN}
                  id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
                  customId={`SUB-${user.uid}-${Date.now()}`}
                  callback_info={{ email: user.email, fullname: user.displayName || '', plan: selectedPlan.id }}
                  mode="LIVE"
                  currency="XOF"
                  callback={handlePaymentSuccess}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,107,0,.35)' }}
                />
              </FeexPayProvider>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Shield size={11} /> Paiement sécurisé par FeexPay
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}