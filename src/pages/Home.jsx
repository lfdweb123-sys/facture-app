import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, CheckCircle, FileText, Shield, CreditCard, Bot,
  Star, Menu, X, Apple, Smartphone, ArrowUp, Zap,
  ChevronRight, TrendingUp, Users, Globe, Send
} from 'lucide-react';
import { useState, useEffect } from 'react';

const SLIDE_WORDS = [
  { word: 'Factures',  color: '#FF6B00' },
  { word: 'Contrats',  color: '#0057FF' },
  { word: 'Paiements', color: '#00A550' },
  { word: 'Devis',     color: '#9B00E8' },
];

function WordSlider() {
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => { setIndex(i => (i + 1) % SLIDE_WORDS.length); setOut(false); }, 320);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const { word, color } = SLIDE_WORDS[index];
  return (
    <span style={{
      color,
      display: 'inline-block',
      transition: 'opacity .28s ease, transform .28s ease',
      opacity: out ? 0 : 1,
      transform: out ? 'translateY(14px)' : 'translateY(0)',
    }}>
      {word}
    </span>
  );
}

function InvoiceMock() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 28px 90px rgba(0,0,0,0.14)',
      padding: '26px 26px 22px',
      width: 310,
      border: '1px solid #F0F0F0',
      fontFamily: 'inherit',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 3 }}>Facture</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>#INV-2024</div>
        </div>
        <span style={{ background: '#ECFDF5', color: '#00A550', fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 100 }}>Payée ✓</span>
      </div>
      <div style={{ background: '#F8F8FB', borderRadius: 12, padding: '11px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 2 }}>Client</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>Aminata Diallo</div>
        <div style={{ fontSize: 12, color: '#999' }}>aminata@studio.bj</div>
      </div>
      {[
        { label: 'Design UI/UX – Sprint 2', amount: '150 000' },
        { label: 'Intégration web', amount: '80 000' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 12 }}>
          <span style={{ color: '#666' }}>{item.label}</span>
          <span style={{ fontWeight: 700, color: '#222' }}>{item.amount} XOF</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 13, alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>Total</span>
        <span style={{ fontWeight: 900, fontSize: 17, color: '#FF6B00' }}>230 000 XOF</span>
      </div>
      <div style={{
        marginTop: 16,
        background: 'linear-gradient(135deg,#FF6B00,#FFAA00)',
        color: '#fff', textAlign: 'center',
        borderRadius: 11, padding: '11px 0',
        fontSize: 13, fontWeight: 700, letterSpacing: '.02em',
      }}>
        Payer maintenant →
      </div>
    </div>
  );
}

function FloatingBadge({ style, iconColor, icon: Icon, children }) {
  return (
    <div style={{
      position: 'absolute',
      background: '#fff',
      borderRadius: 12,
      padding: '8px 14px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 12, fontWeight: 600, color: '#333',
      whiteSpace: 'nowrap',
      border: '1px solid #F0F0F0',
      ...style,
    }}>
      {Icon && <Icon size={13} style={{ color: iconColor }} />}
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 20); setShowTop(window.scrollY > 500); };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const testimonials = [
    { name: 'Sophie M.', role: 'Designer Freelance', text: "Facture App a transformé ma gestion. Je crée des factures en 2 minutes et mes clients paient directement en ligne.", rating: 5 },
    { name: 'Karim D.', role: 'Développeur Web', text: "L'assistant IA m'aide à rédiger des contrats professionnels sans effort. Un gain de temps énorme.", rating: 5 },
    { name: 'Aminata S.', role: 'Consultante Marketing', text: 'Le portefeuille et les retraits sont ultra simples. Je suis mes revenus en temps réel. Application indispensable.', rating: 5 },
    { name: 'David K.', role: 'PME – Tech Solutions', text: "La vérification d'identité et le suivi des paiements sont excellents. Mes clients ont confiance.", rating: 4 },
    { name: 'Fatou B.', role: 'Graphiste', text: "J'envoie mes factures par email en un clic. Le design est propre et professionnel. Je recommande.", rating: 5 },
    { name: 'Marc L.', role: 'Architecte', text: 'Les contrats générés par IA sont complets et juridiquement solides. Un vrai plus pour mon activité.', rating: 4 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif", color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .fa-ani { animation: fadeUp .65s ease both; }
        .fa-float { animation: floatY 4s ease-in-out infinite; }
        .fa-nav-link:hover { color:#FF6B00 !important; }
        .fa-card:hover { box-shadow:0 14px 48px rgba(0,0,0,.09)!important; transform:translateY(-3px); border-color:#E0E0E0!important; }
        .fa-testi:hover { box-shadow:0 8px 32px rgba(0,0,0,.07)!important; transform:translateY(-2px); }
        .fa-plan:hover { border-color:#CCC!important; }
        .fa-plan-btn-outline:hover { border-color:#999!important; color:#111!important; }
        .fa-plan-btn-gold:hover { box-shadow:0 10px 36px rgba(255,107,0,.45)!important; transform:translateY(-1px); }
        .fa-cta-primary:hover { transform:translateY(-2px); box-shadow:0 12px 38px rgba(255,107,0,.45)!important; }
        .fa-cta-secondary:hover { border-color:#CCC!important; background:#F0F0F0!important; }
        @media(max-width:960px){
          .fa-hero-grid { grid-template-columns:1fr!important; }
          .fa-hero-visual { display:none!important; }
          .fa-stats-inner { grid-template-columns:1fr 1fr!important; }
          .fa-stat-2 { border-right:none!important; }
          .fa-feat-grid { grid-template-columns:1fr!important; }
          .fa-pricing-grid { grid-template-columns:1fr!important; max-width:400px; margin-left:auto; margin-right:auto; }
          .fa-testi-grid { grid-template-columns:1fr 1fr!important; }
          .fa-footer-grid { grid-template-columns:1fr 1fr!important; gap:32px!important; }
          .fa-desktop-nav { display:none!important; }
          .fa-mobile-toggle { display:flex!important; }
        }
        @media(max-width:600px){
          .fa-testi-grid { grid-template-columns:1fr!important; }
          .fa-footer-grid { grid-template-columns:1fr!important; }
          .fa-stats-inner { grid-template-columns:1fr 1fr!important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: scrolled ? 'rgba(255,255,255,0.93)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
        transition: 'all .3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', boxShadow: '0 4px 14px rgba(255,107,0,.3)' }}>FA</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Facture App</span>
          </a>

          {/* Desktop center links */}
          <div className="fa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#features" className="fa-nav-link" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}>Fonctionnalités</a>
            <a href="#pricing" className="fa-nav-link" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}>Tarifs</a>
            <a href="#testimonials" className="fa-nav-link" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}>Avis</a>
          </div>

          {/* Desktop right actions */}
          <div className="fa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 12, boxShadow: '0 4px 16px rgba(255,107,0,.3)', transition: 'all .2s' }}>
                Dashboard <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="fa-nav-link" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500, padding: '8px 14px', borderRadius: 10, transition: 'all .2s' }}>Connexion</Link>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 12, boxShadow: '0 4px 16px rgba(255,107,0,.3)', transition: 'all .2s' }}>
                  Essai gratuit <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="fa-mobile-toggle"
            onClick={() => setMobileMenuOpen(v => !v)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 6, alignItems: 'center' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #EEE', padding: '16px 28px 24px' }}>
            {['features','pricing','testimonials'].map((id, i) => (
              <a key={id} href={`#${id}`} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: '#444', borderBottom: i < 2 ? '1px solid #F3F3F3' : 'none', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                {['Fonctionnalités','Tarifs','Avis'][i]}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              <Link to="/login" style={{ display: 'block', textAlign: 'center', border: '1.5px solid #DDD', color: '#444', padding: '12px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Connexion</Link>
              <Link to="/register" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', padding: '12px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Essai gratuit</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(155deg,#FFFAF5 0%,#F7F8FC 65%)', borderBottom: '1px solid #EBEBEB' }}>
        <div className="fa-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '118px 32px 90px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* LEFT */}
          <div className="fa-ani">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFF3EA', border: '1px solid #FFDAB8', color: '#FF6B00', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 100, marginBottom: 26 }}>
              <Zap size={12} /> Propulsé par IA · Paiements FeexPay intégrés
            </div>

            <h1 style={{ fontSize: 'clamp(38px,4.8vw,64px)', fontWeight: 900, lineHeight: 1.07, letterSpacing: '-.03em', marginBottom: 22, color: '#0A0A0A' }}>
              <WordSlider /><br />
              <span style={{ color: '#222' }}>professionnels,<br />en un instant.</span>
            </h1>

            <p style={{ fontSize: 17, color: '#666', lineHeight: 1.7, maxWidth: 460, marginBottom: 34, fontWeight: 400 }}>
              Créez, envoyez, encaissez. La suite tout-en-un pour freelances et PME d'Afrique de l'Ouest. Factures, contrats IA et paiements Mobile Money.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <Link to="/register" className="fa-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', fontSize: 15, fontWeight: 700, padding: '15px 30px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 6px 26px rgba(255,107,0,.35)', transition: 'all .25s' }}>
                Commencer gratuitement <ArrowRight size={17} />
              </Link>
              <a href="#features" className="fa-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #E5E5E5', color: '#333', fontSize: 15, fontWeight: 600, padding: '15px 26px', borderRadius: 14, textDecoration: 'none', transition: 'all .25s' }}>
                Voir les fonctionnalités
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {['Sans engagement', 'Gratuit pour démarrer', 'Support 24/7'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888' }}>
                  <CheckCircle size={13} style={{ color: '#00A550' }} /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="fa-hero-visual" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 460 }}>
            <FloatingBadge style={{ top: 28, right: 0 }} icon={CheckCircle} iconColor="#00A550">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A550', display: 'inline-block' }} />
              Paiement reçu · +85 000 XOF
            </FloatingBadge>
            <FloatingBadge style={{ top: 200, left: -20 }} icon={Bot} iconColor="#0057FF">
              Contrat généré par IA ✨
            </FloatingBadge>
            <FloatingBadge style={{ bottom: 60, right: -10 }} icon={Send} iconColor="#FF6B00">
              Facture envoyée ✓
            </FloatingBadge>
            <div className="fa-float">
              <InvoiceMock />
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
        <div className="fa-stats-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { icon: Users, val: '12 000+', lbl: 'Freelances actifs' },
            { icon: TrendingUp, val: '98%', lbl: 'Satisfaction client' },
            { icon: Globe, val: '4 pays', lbl: "Afrique de l'Ouest" },
            { icon: Zap, val: '< 2 min', lbl: 'Par facture' },
          ].map((s, i, arr) => (
            <div key={i} className={i === 1 ? 'fa-stat-2' : ''} style={{ padding: '30px 24px', borderRight: i < arr.length - 1 ? '1px solid #EBEBEB' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FFF3EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={19} style={{ color: '#FF6B00' }} />
              </div>
              <div>
                <div style={{ fontSize: 23, fontWeight: 900, color: '#111', lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
            <Zap size={11} /> Fonctionnalités
          </div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 14 }}>
            Tout ce dont votre<br />activité a besoin
          </h2>
          <p style={{ fontSize: 16, color: '#777', lineHeight: 1.65, maxWidth: 460 }}>
            Une suite intégrée pensée pour les entrepreneurs d'Afrique de l'Ouest.
          </p>

          <div className="fa-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18, marginTop: 50 }}>
            {[
              { icon: FileText, title: 'Factures Professionnelles', desc: "Créez des factures élégantes en moins de 2 minutes. Export PDF instantané, envoi email automatique, suivi des paiements en temps réel.", pill: 'Export PDF · Email auto', pillBg: '#FFF3EA', pillColor: '#FF6B00', iconBg: '#FFF3EA', iconColor: '#FF6B00' },
              { icon: Bot, title: 'Assistant IA Intégré', desc: "Claude et GPT-4 à portée de main. Rédigez contrats, emails clients, devis et documents légaux en quelques secondes.", pill: 'GPT-4 + Claude', pillBg: '#EBF0FF', pillColor: '#0057FF', iconBg: '#EBF0FF', iconColor: '#0057FF' },
              { icon: Shield, title: 'Contrats Légaux IA', desc: "Générez des contrats complets et juridiquement solides adaptés à votre secteur. Freelance, prestation de service, partenariat.", pill: 'Juridiquement valide', pillBg: '#EDFAF3', pillColor: '#00A550', iconBg: '#EDFAF3', iconColor: '#00A550' },
              { icon: CreditCard, title: 'Paiements Mobile Money', desc: "Acceptez MTN, Moov, Wave, cartes bancaires via FeexPay. Encaissez depuis le Bénin, Togo, Côte d'Ivoire, Sénégal.", pill: 'FeexPay · Mobile Money', pillBg: '#F4EBFF', pillColor: '#9B00E8', iconBg: '#F4EBFF', iconColor: '#9B00E8' },
            ].map((f, i) => (
              <div key={i} className="fa-card" style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 20, padding: '32px', transition: 'all .3s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={22} style={{ color: f.iconColor }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 10 }}>{f.title}</div>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7 }}>{f.desc}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '5px 12px', marginTop: 18, background: f.pillBg, color: f.pillColor }}>
                  <CheckCircle size={10} /> {f.pill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: '#fff', padding: '90px 32px', borderTop: '1px solid #EBEBEB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12, justifyContent: 'center' }}>
              <TrendingUp size={11} /> Tarifs
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 14 }}>
              Commencez gratuitement,<br />évoluez à votre rythme
            </h2>
            <p style={{ fontSize: 16, color: '#777', lineHeight: 1.65, maxWidth: 400, margin: '0 auto' }}>Sans carte bancaire requise pour démarrer.</p>
          </div>

          <div className="fa-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 52 }}>
            {/* Gratuit */}
            <div className="fa-plan" style={{ border: '1.5px solid #EBEBEB', borderRadius: 22, padding: '36px', display: 'flex', flexDirection: 'column', background: '#FAFAFA', transition: 'all .3s', position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Gratuit</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#111', letterSpacing: '-.02em', lineHeight: 1 }}>0 XOF</div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 6, marginBottom: 4 }}>/ mois · Pour découvrir</div>
              <div style={{ height: 1, background: '#EBEBEB', margin: '22px 0' }} />
              {['5 factures / mois', '2 contrats IA', 'Paiements limités', 'Assistant IA basique'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#555', marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: '#00A550', flexShrink: 0 }} /> {t}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" className="fa-plan-btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '13px 20px', borderRadius: 12, border: '1.5px solid #DDD', color: '#555', transition: 'all .25s', marginTop: 24 }}>Commencer</Link>
            </div>

            {/* Pro */}
            <div style={{ background: '#fff', border: '2px solid #FF6B00', borderRadius: 22, padding: '36px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 12px 52px rgba(255,107,0,.13)' }}>
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 16px', borderRadius: 100, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>⚡ Le plus populaire</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Pro</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#111', letterSpacing: '-.02em', lineHeight: 1 }}>9 999 XOF</div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 6, marginBottom: 4 }}>/ mois · Pour les indépendants</div>
              <div style={{ height: 1, background: '#EBEBEB', margin: '22px 0' }} />
              {['Factures illimitées', 'Contrats IA illimités', 'Paiements illimités', 'Assistant IA complet', 'Support prioritaire'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#555', marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: '#FF6B00', flexShrink: 0 }} /> {t}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" className="fa-plan-btn-gold" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '13px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', color: '#fff', boxShadow: '0 5px 20px rgba(255,107,0,.3)', transition: 'all .25s', marginTop: 24 }}>Essai gratuit 14 jours</Link>
            </div>

            {/* Business */}
            <div className="fa-plan" style={{ border: '1.5px solid #EBEBEB', borderRadius: 22, padding: '36px', display: 'flex', flexDirection: 'column', background: '#FAFAFA', transition: 'all .3s', position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Business</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#111', letterSpacing: '-.02em', lineHeight: 1 }}>24 999 XOF</div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 6, marginBottom: 4 }}>/ mois · Pour les PME</div>
              <div style={{ height: 1, background: '#EBEBEB', margin: '22px 0' }} />
              {['Tout en Pro', 'Multi-utilisateurs', 'API dédiée', 'Personnalisation complète', 'Support dédié 24/7'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#555', marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: '#00A550', flexShrink: 0 }} /> {t}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" className="fa-plan-btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '13px 20px', borderRadius: 12, border: '1.5px solid #DDD', color: '#555', transition: 'all .25s', marginTop: 24 }}>Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
            <Star size={11} /> Témoignages
          </div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 14 }}>
            Ils nous font confiance
          </h2>
          <p style={{ fontSize: 16, color: '#777', lineHeight: 1.65, maxWidth: 420 }}>
            Des milliers d'entrepreneurs utilisent Facture App chaque jour.
          </p>
          <div className="fa-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 50 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="fa-testi" style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 18, padding: '24px', transition: 'all .3s' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} style={{ color: j < t.rating ? '#FFAA00' : '#EEE', fill: j < t.rating ? '#FFAA00' : 'transparent' }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.75, margin: '10px 0 16px' }}>"{t.text}"</p>
                <div style={{ borderTop: '1px solid #F3F3F3', paddingTop: 13 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP SECTION ── */}
      <div style={{ background: 'linear-gradient(135deg,#FF6B00 0%,#FFAA00 100%)', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#fff', letterSpacing: '-.025em', marginBottom: 14 }}>
          Facture App, partout avec vous
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', maxWidth: 380, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Disponible sur iOS et Android. Gérez votre activité depuis votre téléphone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#111', fontSize: 14, fontWeight: 700, padding: '14px 28px', borderRadius: 14, textDecoration: 'none', transition: 'all .25s' }}>
            <Apple size={20} /> App Store
          </a>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.18)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', fontSize: 14, fontWeight: 700, padding: '14px 28px', borderRadius: 14, textDecoration: 'none', transition: 'all .25s' }}>
            <Smartphone size={20} /> Google Play
          </a>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,.65)' }}>Ou utilisez la version web sur tous vos appareils</p>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0A0F', padding: '64px 32px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="fa-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#FF6B00,#FFAA00)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>FA</div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Facture App</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.75, margin: '14px 0 18px' }}>
                Solution complète de facturation, contrats IA et paiements pour freelances et PME d'Afrique de l'Ouest.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {["🇧🇯 Bénin", "🇹🇬 Togo", "🇨🇮 Côte d'Ivoire", "🇸🇳 Sénégal"].map((c, i) => (
                  <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.07)', padding: '4px 10px', borderRadius: 6 }}>{c}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'Sécurité', 'Mises à jour'] },
              { title: 'Ressources', links: ['Blog', 'Aide & Support', 'API Documentation', 'Statut'] },
              { title: 'Légal', links: ['Confidentialité', 'CGU', 'Cookies', 'Mentions légales'] },
            ].map((col, ci) => (
              <div key={ci}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 18 }}>{col.title}</div>
                {col.links.map((l, li) => (
                  <a key={li} href="#" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none', marginBottom: 11 }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.45)'}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© {new Date().getFullYear()} Facture App. Tous droits réservés.</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Développé avec ❤️ depuis le Bénin</span>
          </div>
        </div>
      </footer>

      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Retour en haut"
          style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, width: 42, height: 42, borderRadius: 12, background: '#fff', border: '1.5px solid #EEE', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(0,0,0,.12)', transition: 'all .25s' }}>
          <ArrowUp size={17} />
        </button>
      )}
    </div>
  );
}