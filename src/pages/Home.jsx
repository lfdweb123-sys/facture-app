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
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const testimonials = [
    { name: 'Sophie M.', role: 'Designer Freelance', text: 'Facture App a transformé ma gestion administrative. Je crée des factures en 2 minutes et mes clients paient directement en ligne.', rating: 5 },
    { name: 'Karim D.', role: 'Développeur Web', text: 'L\'assistant IA est bluffant. Il m\'aide à rédiger des contrats professionnels sans effort. Un gain de temps énorme.', rating: 5 },
    { name: 'Aminata S.', role: 'Consultante Marketing', text: 'Le portefeuille et les retraits sont ultra simples. Je suis mes revenus en temps réel. Application indispensable.', rating: 5 },
    { name: 'David K.', role: 'PME - Tech Solutions', text: 'La vérification d\'identité et le suivi des paiements sont excellents. Mes clients ont confiance.', rating: 4 },
    { name: 'Fatou B.', role: 'Graphiste', text: 'J\'envoie mes factures par email en un clic. Le design est propre et professionnel. Je recommande.', rating: 5 },
    { name: 'Marc L.', role: 'Architecte', text: 'Les contrats générés par IA sont complets et juridiquement solides. Un vrai plus pour mon activité.', rating: 4 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">FA</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Facture App</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Avis</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link to="/dashboard" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Connexion</Link>
                  <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                    Essai gratuit
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-gray-600 py-2">Fonctionnalités</a>
              <a href="#pricing" className="block text-sm text-gray-600 py-2">Tarifs</a>
              <a href="#testimonials" className="block text-sm text-gray-600 py-2">Avis</a>
              {user ? (
                <Link to="/dashboard" className="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium">Dashboard</Link>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <Link to="/login" className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-xl text-sm">Connexion</Link>
                  <Link to="/register" className="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-xl text-sm">Essai gratuit</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap size={14} />
            Assistant IA intégré · Paiements FeexPay
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Factures, contrats et paiements{' '}
            <span className="text-gray-900 underline decoration-gray-300 decoration-4 underline-offset-4">simplifiés</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Créez des factures professionnelles, générez des contrats avec l'IA, encaissez des paiements en ligne. Tout ce dont votre activité a besoin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-2">
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <a href="#features" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-300 transition-all inline-flex items-center justify-center">
              Découvrir
            </a>
          </div>
          <div className="flex items-center justify-center gap-4 mt-10 text-sm text-gray-500">
            <CheckCircle size={14} className="text-emerald-500" /> Sans engagement
            <CheckCircle size={14} className="text-emerald-500" /> Vérification sécurisée
            <CheckCircle size={14} className="text-emerald-500" /> Support 24/7
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Une suite complète pour gérer votre activité de A à Z</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Factures Pro', desc: 'Créez des factures en quelques clics. Export PDF, envoi par email automatique.' },
              { icon: Shield, title: 'Contrats IA', desc: 'Générez des contrats juridiques avec l\'intelligence artificielle.' },
              { icon: CreditCard, title: 'Paiements', desc: 'Acceptez Mobile Money et cartes bancaires via FeexPay.' },
              { icon: Bot, title: 'Assistant IA', desc: 'ChatGPT et Claude pour toutes vos tâches administratives.' }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors">
                  <feature.icon size={20} className="text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Des tarifs simples</h2>
            <p className="text-gray-600">Commencez gratuitement, évoluez à votre rythme</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <p className="text-gray-500 text-sm mb-6">Pour découvrir</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">0 XOF<span className="text-base text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8">
                  {['5 factures/mois', '2 contrats', 'Paiements limités', 'Assistant IA basique'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="mt-auto w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-900 hover:text-gray-900 transition-all">Commencer</Link>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 rounded-2xl p-8 text-white flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold">Populaire</div>
              <div className="mt-2">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-gray-400 text-sm mb-6">Pour les indépendants</p>
                <div className="text-4xl font-bold mb-6">9 999 XOF<span className="text-base text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8">
                  {['Factures illimitées', 'Contrats illimités', 'Paiements illimités', 'Assistant IA complet', 'Support prioritaire'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="mt-auto w-full text-center bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all">Essai gratuit</Link>
            </div>

            {/* Business */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-500 text-sm mb-6">Pour les PME</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">24 999 XOF<span className="text-base text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8">
                  {['Tout en Pro', 'Multi-utilisateurs', 'API dédiée', 'Personnalisation', 'Support dédié 24/7'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="mt-auto w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-900 hover:text-gray-900 transition-all">Contactez-nous</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-gray-600">Ils utilisent Facture App au quotidien</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-all">
                <Quote size={24} className="text-gray-300 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Télécharger l'app */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Installez l'application</h2>
          <p className="text-gray-400 mb-10 max-w-lg mx-auto">Disponible sur iOS et Android. Retrouvez Facture App partout avec vous.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              <Apple size={24} /> App Store
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-3 bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700">
              <Smartphone size={24} /> Google Play
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-6">Ou utilisez la version web sur tous vos appareils</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 text-xs font-bold">FA</span>
                </div>
                <span className="text-white font-bold text-lg">Facture App</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">Solution complète de facturation, contrats et paiements pour freelances et PME.</p>
              <div className="flex gap-3">
                {['🇧🇯 Bénin', '🇹🇬 Togo', '🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal'].map((c, i) => (
                  <span key={i} className="text-xs">{c}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mises à jour</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aide & Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Statut</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Facture App. Tous droits réservés.</p>
            <p className="text-sm">Développé avec ❤️ depuis le Bénin</p>
          </div>
        </div>
      </footer>

      {/* Retour en haut */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all animate-fade-in"
          aria-label="Retour en haut"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}