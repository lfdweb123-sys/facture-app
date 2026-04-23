import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Shield,
  CreditCard,
  Bot,
  Star,
  Menu,
  X,
  Apple,
  Smartphone,
  ArrowUp,
  Quote,
  Zap,
  ChevronRight,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const SLIDE_WORDS = [
  { word: 'Factures', color: '#F5A623' },
  { word: 'Contrats', color: '#7ED321' },
  { word: 'Paiements', color: '#4A90E2' },
  { word: 'Votre activité', color: '#BD10E0' },
];

function HeroWordSlider() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SLIDE_WORDS.length);
        setAnimating(false);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = SLIDE_WORDS[index];

  return (
    <span
      style={{
        display: 'inline-block',
        color: current.color,
        transition: 'opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(18px) scale(0.97)' : 'translateY(0) scale(1)',
        minWidth: '320px',
        textAlign: 'left',
      }}
    >
      {current.word}
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const testimonials = [
    { name: 'Sophie M.', role: 'Designer Freelance', text: 'Facture App a transformé ma gestion administrative. Je crée des factures en 2 minutes et mes clients paient directement en ligne.', rating: 5 },
    { name: 'Karim D.', role: 'Développeur Web', text: "L'assistant IA est bluffant. Il m'aide à rédiger des contrats professionnels sans effort. Un gain de temps énorme.", rating: 5 },
    { name: 'Aminata S.', role: 'Consultante Marketing', text: 'Le portefeuille et les retraits sont ultra simples. Je suis mes revenus en temps réel. Application indispensable.', rating: 5 },
    { name: 'David K.', role: 'PME - Tech Solutions', text: 'La vérification d\'identité et le suivi des paiements sont excellents. Mes clients ont confiance.', rating: 4 },
    { name: 'Fatou B.', role: 'Graphiste', text: "J'envoie mes factures par email en un clic. Le design est propre et professionnel. Je recommande.", rating: 5 },
    { name: 'Marc L.', role: 'Architecte', text: 'Les contrats générés par IA sont complets et juridiquement solides. Un vrai plus pour mon activité.', rating: 4 }
  ];

  const stats = [
    { value: '12 000+', label: 'Freelances actifs', icon: Users },
    { value: '98%', label: 'Satisfaction client', icon: TrendingUp },
    { value: '4 pays', label: "Couverts en Afrique", icon: Globe },
    { value: '< 2 min', label: 'Par facture', icon: Zap },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', fontFamily: "'Sora', 'DM Sans', sans-serif", color: '#fff' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        * { box-sizing: border-box; }

        :root {
          --gold: #F5A623;
          --green: #7ED321;
          --blue: #4A90E2;
          --purple: #BD10E0;
          --surface: #13131A;
          --border: rgba(255,255,255,0.07);
          --text-muted: rgba(255,255,255,0.45);
        }

        html { scroll-behavior: smooth; }

        /* NAV */
        .nav-wrap {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;
        }
        .nav-wrap.scrolled {
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 28px;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #F5A623, #FF6B35);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #fff;
          box-shadow: 0 4px 16px rgba(245,166,35,0.35);
        }
        .logo-text { font-size: 16px; font-weight: 700; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .btn-ghost { font-size: 14px; color: var(--text-muted); text-decoration: none; padding: 8px 16px; border-radius: 10px; transition: all 0.2s; font-weight: 500; }
        .btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .btn-primary {
          font-size: 14px; font-weight: 600;
          background: linear-gradient(135deg, #F5A623, #FF6B35);
          color: #fff; text-decoration: none;
          padding: 9px 22px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(245,166,35,0.3);
          transition: all 0.25s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(245,166,35,0.45); }

        /* HERO */
        .hero {
          padding: 170px 28px 110px;
          max-width: 1200px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,166,35,0.1);
          border: 1px solid rgba(245,166,35,0.25);
          color: #F5A623; font-size: 13px; font-weight: 500;
          padding: 7px 16px; border-radius: 100px;
          margin-bottom: 36px;
          animation: fadeUp 0.6s ease both;
        }
        .hero-title {
          font-size: clamp(42px, 6vw, 80px);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 28px;
          color: #fff;
          animation: fadeUp 0.7s 0.08s ease both;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 19px);
          color: var(--text-muted);
          max-width: 560px;
          line-height: 1.65;
          margin-bottom: 48px;
          font-weight: 400;
          animation: fadeUp 0.7s 0.16s ease both;
        }
        .hero-ctas {
          display: flex; flex-wrap: wrap; gap: 14px;
          margin-bottom: 52px;
          animation: fadeUp 0.7s 0.22s ease both;
        }
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #F5A623, #FF6B35);
          color: #fff; font-size: 16px; font-weight: 700;
          padding: 16px 36px; border-radius: 14px;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(245,166,35,0.35);
          transition: all 0.25s;
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 42px rgba(245,166,35,0.5); }
        .btn-hero-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8); font-size: 16px; font-weight: 600;
          padding: 16px 32px; border-radius: 14px;
          text-decoration: none;
          transition: all 0.25s;
        }
        .btn-hero-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); }
        .hero-trust {
          display: flex; align-items: center; gap: 20px;
          flex-wrap: wrap;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .trust-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--text-muted); }

        /* STATS BAR */
        .stats-bar {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .stats-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 28px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .stat-item {
          padding: 36px 28px;
          border-right: 1px solid var(--border);
          display: flex; align-items: center; gap: 16px;
        }
        .stat-item:last-child { border-right: none; }
        .stat-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(245,166,35,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-value { font-size: 26px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 13px; color: var(--text-muted); }

        /* FEATURES */
        .section { padding: 100px 28px; max-width: 1200px; margin: 0 auto; }
        .section-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #F5A623;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 800; color: #fff;
          letter-spacing: -0.025em; margin-bottom: 16px; line-height: 1.1;
        }
        .section-sub { font-size: 17px; color: var(--text-muted); max-width: 480px; line-height: 1.6; }

        .features-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 20px; margin-top: 60px;
        }
        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 36px;
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,166,35,0.5), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(245,166,35,0.25); box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
        .feature-card:hover::before { opacity: 1; }
        .feature-card.large { grid-column: span 1; }
        .feat-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .feat-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .feat-desc { font-size: 15px; color: var(--text-muted); line-height: 1.65; }
        .feat-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; color: inherit;
          background: rgba(255,255,255,0.07); border-radius: 100px;
          padding: 5px 12px; margin-top: 20px;
        }

        /* PRICING */
        .pricing-section { background: var(--surface); padding: 100px 0; }
        .pricing-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px; margin-top: 60px;
        }
        .pricing-card {
          background: #0A0A0F;
          border: 1px solid var(--border);
          border-radius: 24px; padding: 40px;
          display: flex; flex-direction: column;
          position: relative; transition: all 0.3s;
        }
        .pricing-card:hover { border-color: rgba(245,166,35,0.3); transform: translateY(-3px); }
        .pricing-card.featured {
          background: linear-gradient(145deg, #1A1204, #0F0F17);
          border-color: rgba(245,166,35,0.5);
          box-shadow: 0 0 0 1px rgba(245,166,35,0.15), 0 32px 80px rgba(0,0,0,0.6);
        }
        .popular-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg, #F5A623, #FF6B35);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 5px 18px; border-radius: 100px; white-space: nowrap;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .plan-name { font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .plan-price { font-size: 42px; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1; }
        .plan-price span { font-size: 14px; font-weight: 400; color: var(--text-muted); }
        .plan-desc { font-size: 13px; color: var(--text-muted); margin: 12px 0 28px; }
        .plan-divider { height: 1px; background: var(--border); margin-bottom: 28px; }
        .plan-features { flex: 1; space-y: 14px; margin-bottom: 32px; }
        .plan-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,0.75); margin-bottom: 14px; }
        .btn-plan {
          display: block; text-align: center; text-decoration: none;
          font-size: 15px; font-weight: 600;
          padding: 14px 24px; border-radius: 12px;
          transition: all 0.25s;
        }
        .btn-plan-outline {
          border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7);
        }
        .btn-plan-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; background: rgba(255,255,255,0.05); }
        .btn-plan-gold {
          background: linear-gradient(135deg, #F5A623, #FF6B35);
          color: #fff;
          box-shadow: 0 6px 24px rgba(245,166,35,0.35);
        }
        .btn-plan-gold:hover { box-shadow: 0 10px 36px rgba(245,166,35,0.5); transform: translateY(-1px); }

        /* TESTIMONIALS */
        .testi-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px;
          transition: all 0.3s;
        }
        .testi-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-3px); }
        .testi-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 12px 0 16px; }
        .testi-name { font-size: 14px; font-weight: 600; color: #fff; }
        .testi-role { font-size: 12px; color: var(--text-muted); }

        /* APP SECTION */
        .app-section {
          background: linear-gradient(135deg, #0F0B01, #0A0A0F);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 100px 28px;
          text-align: center;
        }
        .app-title { font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 16px; }
        .app-sub { font-size: 17px; color: var(--text-muted); max-width: 420px; margin: 0 auto 48px; line-height: 1.6; }
        .app-btns { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .btn-app {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          padding: 15px 30px; border-radius: 14px; transition: all 0.25s;
        }
        .btn-app-light { background: #fff; color: #000; }
        .btn-app-light:hover { background: #f0f0f0; transform: translateY(-2px); }
        .btn-app-dark { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.85); }
        .btn-app-dark:hover { background: rgba(255,255,255,0.13); transform: translateY(-2px); }

        /* FOOTER */
        footer { background: #06060A; border-top: 1px solid var(--border); padding: 72px 28px 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
        .footer-about { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin: 16px 0 20px; }
        .footer-flags { display: flex; flex-wrap: wrap; gap: 8px; }
        .footer-flag { font-size: 12px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; }
        .footer-col-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
        .footer-link { display: block; font-size: 14px; color: var(--text-muted); text-decoration: none; margin-bottom: 12px; transition: color 0.2s; }
        .footer-link:hover { color: #fff; }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-size: 13px; color: var(--text-muted); }

        /* SCROLL TOP */
        .scroll-top {
          position: fixed; bottom: 28px; right: 28px; z-index: 999;
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
        }
        .scroll-top:hover { background: rgba(255,255,255,0.18); transform: translateY(-2px); }

        /* MOBILE MENU */
        .mobile-menu {
          background: rgba(10,10,15,0.97); backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 20px 28px 28px;
        }
        .mobile-link { display: block; font-size: 16px; color: rgba(255,255,255,0.7); padding: 13px 0; border-bottom: 1px solid var(--border); text-decoration: none; }
        .mobile-link:last-of-type { border-bottom: none; }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(245,166,35,0); }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .features-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
          .nav-links, .nav-actions { display: none; }
        }
        @media (max-width: 600px) {
          .stats-inner { grid-template-columns: 1fr 1fr; }
          .stat-item { padding: 24px 16px; }
          .footer-grid { grid-template-columns: 1fr; }
        }

        /* Testimonials grid */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 56px; }
        @media (max-width: 900px) { .testi-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .testi-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* ─── NAVIGATION ─── */}
      <nav className={`nav-wrap${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="logo">
            <div className="logo-mark">FA</div>
            <span className="logo-text">Facture App</span>
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#pricing" className="nav-link">Tarifs</a>
            <a href="#testimonials" className="nav-link">Avis</a>
          </div>

          <div className="nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Dashboard <ChevronRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Connexion</Link>
                <Link to="/register" className="btn-primary">
                  Essai gratuit <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}
            className="md:block"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#testimonials" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Avis</a>
            <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center', textAlign: 'center' }}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-hero-secondary" style={{ justifyContent: 'center' }}>Connexion</Link>
                  <Link to="/register" className="btn-hero-primary" style={{ justifyContent: 'center' }}>Essai gratuit</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: 170, paddingBottom: 110, paddingLeft: 28, paddingRight: 28 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="hero-badge">
            <Zap size={13} />
            Propulsé par IA · Paiements FeexPay intégrés
          </div>

          <h1 className="hero-title">
            <HeroWordSlider />
            <br />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
              professionnels,<br />en un instant.
            </span>
          </h1>

          <p className="hero-subtitle">
            Créez, envoyez, encaissez. La suite tout-en-un pour freelances et PME
            d'Afrique de l'Ouest. Factures, contrats IA et paiements Mobile Money.
          </p>

          <div className="hero-ctas">
            <Link to="/register" className="btn-hero-primary">
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-hero-secondary">
              Voir les fonctionnalités
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <CheckCircle size={14} style={{ color: '#7ED321' }} />
              Sans engagement
            </div>
            <div className="trust-item">
              <CheckCircle size={14} style={{ color: '#7ED321' }} />
              Vérification sécurisée
            </div>
            <div className="trust-item">
              <CheckCircle size={14} style={{ color: '#7ED321' }} />
              Support 24/7
            </div>
            <div className="trust-item">
              <CheckCircle size={14} style={{ color: '#7ED321' }} />
              Gratuit pour démarrer
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div className="stats-bar">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-icon-wrap">
                <s.icon size={20} style={{ color: '#F5A623' }} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-tag">
            <Zap size={12} /> Fonctionnalités
          </div>
          <h2 className="section-title">Tout ce dont votre<br />activité a besoin</h2>
          <p className="section-sub">Une suite intégrée conçue pour la réalité des entrepreneurs africains.</p>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card" style={{ background: 'linear-gradient(145deg, #13110A, #13131A)' }}>
              <div className="feat-icon-wrap" style={{ background: 'rgba(245,166,35,0.15)' }}>
                <FileText size={24} style={{ color: '#F5A623' }} />
              </div>
              <h3 className="feat-title">Factures Professionnelles</h3>
              <p className="feat-desc">
                Créez des factures élégantes en moins de 2 minutes. Export PDF instantané,
                envoi email automatique, suivi des paiements en temps réel.
              </p>
              <span className="feat-pill" style={{ color: '#F5A623' }}>
                <CheckCircle size={11} /> Export PDF · Email auto
              </span>
            </div>

            {/* Card 2 */}
            <div className="feature-card" style={{ background: 'linear-gradient(145deg, #0A0F13, #13131A)' }}>
              <div className="feat-icon-wrap" style={{ background: 'rgba(74,144,226,0.15)' }}>
                <Bot size={24} style={{ color: '#4A90E2' }} />
              </div>
              <h3 className="feat-title">Assistant IA Intégré</h3>
              <p className="feat-desc">
                Claude et GPT-4 à portée de main. Rédigez contrats, emails clients,
                devis et documents légaux sans effort, en quelques secondes.
              </p>
              <span className="feat-pill" style={{ color: '#4A90E2' }}>
                <Bot size={11} /> GPT-4 + Claude
              </span>
            </div>

            {/* Card 3 */}
            <div className="feature-card" style={{ background: 'linear-gradient(145deg, #0A130A, #13131A)' }}>
              <div className="feat-icon-wrap" style={{ background: 'rgba(126,211,33,0.15)' }}>
                <Shield size={24} style={{ color: '#7ED321' }} />
              </div>
              <h3 className="feat-title">Contrats Légaux IA</h3>
              <p className="feat-desc">
                Générez des contrats complets et juridiquement solides adaptés
                à votre secteur. Modèles pour freelance, prestation, partenariat.
              </p>
              <span className="feat-pill" style={{ color: '#7ED321' }}>
                <Shield size={11} /> Juridiquement valide
              </span>
            </div>

            {/* Card 4 */}
            <div className="feature-card" style={{ background: 'linear-gradient(145deg, #130A13, #13131A)' }}>
              <div className="feat-icon-wrap" style={{ background: 'rgba(189,16,224,0.15)' }}>
                <CreditCard size={24} style={{ color: '#BD10E0' }} />
              </div>
              <h3 className="feat-title">Paiements Mobile Money</h3>
              <p className="feat-desc">
                Acceptez MTN, Moov, Wave, cartes bancaires via FeexPay. Encaissez
                depuis le Bénin, Togo, Côte d'Ivoire et Sénégal sans friction.
              </p>
              <span className="feat-pill" style={{ color: '#BD10E0' }}>
                <CreditCard size={11} /> FeexPay · Mobile Money
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-inner">
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <TrendingUp size={12} /> Tarifs
            </div>
            <h2 className="section-title">Commencez gratuitement,<br />évoluez à votre rythme</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Sans carte bancaire requise pour démarrer.</p>
          </div>

          <div className="pricing-grid">
            {/* Gratuit */}
            <div className="pricing-card">
              <div className="plan-name">Gratuit</div>
              <div className="plan-price">0 XOF<span>/mois</span></div>
              <div className="plan-desc">Pour tester et découvrir</div>
              <div className="plan-divider" />
              <div className="plan-features">
                {['5 factures / mois', '2 contrats IA', 'Paiements limités', 'Assistant IA basique'].map((item, i) => (
                  <div key={i} className="plan-feature">
                    <CheckCircle size={14} style={{ color: '#7ED321', flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-plan btn-plan-outline">Commencer</Link>
            </div>

            {/* Pro */}
            <div className="pricing-card featured">
              <div className="popular-badge">⚡ Le plus populaire</div>
              <div className="plan-name" style={{ color: '#F5A623' }}>Pro</div>
              <div className="plan-price">9 999 XOF<span>/mois</span></div>
              <div className="plan-desc">Pour les indépendants actifs</div>
              <div className="plan-divider" />
              <div className="plan-features">
                {['Factures illimitées', 'Contrats IA illimités', 'Paiements illimités', 'Assistant IA complet', 'Support prioritaire'].map((item, i) => (
                  <div key={i} className="plan-feature">
                    <CheckCircle size={14} style={{ color: '#F5A623', flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-plan btn-plan-gold">Essai gratuit 14 jours</Link>
            </div>

            {/* Business */}
            <div className="pricing-card">
              <div className="plan-name">Business</div>
              <div className="plan-price">24 999 XOF<span>/mois</span></div>
              <div className="plan-desc">Pour les équipes et PME</div>
              <div className="plan-divider" />
              <div className="plan-features">
                {['Tout en Pro', 'Multi-utilisateurs', 'API dédiée', 'Personnalisation complète', 'Support dédié 24/7'].map((item, i) => (
                  <div key={i} className="plan-feature">
                    <CheckCircle size={14} style={{ color: '#7ED321', flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-plan btn-plan-outline">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-tag">
            <Star size={12} /> Témoignages
          </div>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-sub">Des milliers d'entrepreneurs utilisent Facture App chaque jour.</p>

          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card">
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} style={{ color: j < t.rating ? '#F5A623' : 'rgba(255,255,255,0.1)', fill: j < t.rating ? '#F5A623' : 'transparent' }} />
                  ))}
                </div>
                <p className="testi-text">"{t.text}"</p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── APP DOWNLOAD ─── */}
      <div className="app-section">
        <h2 className="app-title">Facture App,<br />partout avec vous</h2>
        <p className="app-sub">Disponible sur iOS et Android. Gérez votre activité depuis votre téléphone.</p>
        <div className="app-btns">
          <a href="#" className="btn-app btn-app-light">
            <Apple size={22} /> App Store
          </a>
          <a href="#" className="btn-app btn-app-dark">
            <Smartphone size={22} /> Google Play
          </a>
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Ou utilisez directement la version web sur tous vos appareils
        </p>
      </div>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <a href="#" className="logo" style={{ marginBottom: 0 }}>
                <div className="logo-mark">FA</div>
                <span className="logo-text">Facture App</span>
              </a>
              <p className="footer-about">
                Solution complète de facturation, contrats IA et paiements pour freelances et PME d'Afrique de l'Ouest.
              </p>
              <div className="footer-flags">
                {['🇧🇯 Bénin', '🇹🇬 Togo', '🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal'].map((c, i) => (
                  <span key={i} className="footer-flag">{c}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="footer-col-title">Produit</div>
              <a href="#features" className="footer-link">Fonctionnalités</a>
              <a href="#pricing" className="footer-link">Tarifs</a>
              <a href="#" className="footer-link">Sécurité</a>
              <a href="#" className="footer-link">Mises à jour</a>
            </div>

            <div>
              <div className="footer-col-title">Ressources</div>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Aide & Support</a>
              <a href="#" className="footer-link">API Docs</a>
              <a href="#" className="footer-link">Statut</a>
            </div>

            <div>
              <div className="footer-col-title">Légal</div>
              <a href="#" className="footer-link">Confidentialité</a>
              <a href="#" className="footer-link">CGU</a>
              <a href="#" className="footer-link">Cookies</a>
              <a href="#" className="footer-link">Mentions légales</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} Facture App. Tous droits réservés.</p>
            <p className="footer-copy">Développé avec ❤️ depuis le Bénin</p>
          </div>
        </div>
      </footer>

      {/* ─── SCROLL TOP ─── */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-top" aria-label="Retour en haut">
          <ArrowUp size={17} />
        </button>
      )}
    </div>
  );
}