import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  TrendingUp, 
  CreditCard,
  Sparkles,
  Users,
  Star,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                FreelancePro
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Fonctionnalités</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Tarifs</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900">Témoignages</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Connexion
                  </Link>
                  <Link to="/register" className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                    Essai gratuit
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-gray-600">Fonctionnalités</a>
              <a href="#pricing" className="block text-sm text-gray-600">Tarifs</a>
              {user ? (
                <Link to="/dashboard" className="block w-full text-center bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Dashboard
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
                    Connexion
                  </Link>
                  <Link to="/register" className="block w-full text-center bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                    Essai gratuit
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                Nouveau : Assistant IA intégré
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Gérez votre activité de
                <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent"> freelance </span>
                comme un pro
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Factures, contrats, paiements en ligne et assistant IA. Tout ce dont vous avez besoin pour développer votre activité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all">
                  Commencer gratuitement
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-orange-300 transition-all">
                  Voir la démo
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 border-2 border-white" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">+500</span> freelances nous font confiance
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-3xl p-8 relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Revenus ce mois</div>
                      <div className="text-2xl font-bold text-gray-900">2 450 000 XOF</div>
                    </div>
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">+12.5%</div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Factures</div>
                      <div className="font-bold text-gray-900">24</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Contrats</div>
                      <div className="font-bold text-gray-900">8</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Clients</div>
                      <div className="font-bold text-gray-900">16</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Une suite complète d'outils professionnels pour gérer votre activité de A à Z</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CreditCard, title: 'Factures Pro', desc: 'Créez des factures conformes en quelques clics. Export PDF, rappels automatiques.', color: 'from-orange-500 to-orange-600' },
              { icon: Shield, title: 'Contrats Sécurisés', desc: 'Générez des contrats juridiques avec l\'IA. Signatures électroniques intégrées.', color: 'from-blue-500 to-blue-600' },
              { icon: TrendingUp, title: 'Paiements en Ligne', desc: 'Acceptez Mobile Money, cartes bancaires. Paiements sécurisés avec FeexPay.', color: 'from-green-500 to-green-600' },
              { icon: Sparkles, title: 'Assistant IA', desc: 'ChatGPT et Claude vous assistent pour toutes vos tâches administratives.', color: 'from-purple-500 to-purple-600' }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
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
            <p className="text-gray-600">Commencez gratuitement, passez à la version pro quand vous voulez</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <p className="text-gray-600 mb-6">Pour démarrer</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">0 XOF<span className="text-lg text-gray-500">/mois</span></div>
              <ul className="space-y-3 mb-8">
                {['5 factures/mois', '2 contrats', 'Paiements limités', 'Support email'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-orange-300 transition-all">
                Commencer
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl p-8 text-white transform scale-105">
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">Populaire</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-white/80 mb-6">Pour les pros</p>
              <div className="text-4xl font-bold mb-6">9 999 XOF<span className="text-lg text-white/70">/mois</span></div>
              <ul className="space-y-3 mb-8">
                {['Factures illimitées', 'Contrats illimités', 'Paiements illimités', 'Assistant IA', 'Support prioritaire'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle size={16} className="text-white flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all">
                Essai gratuit
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">Sur mesure</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">Contact<span className="text-lg text-gray-500">-nous</span></div>
              <ul className="space-y-3 mb-8">
                {['Tout en Pro', 'API dédiée', 'Multi-utilisateurs', 'Formation', 'Support 24/7'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-blue-300 transition-all">
                Contactez-nous
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-bold">FreelancePro</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 FreelancePro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}