import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  FileCheck, 
  Bot, 
  DollarSign, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-orange-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gérez votre activité de
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent"> freelance </span>
              simplement
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Créez des factures professionnelles, générez des contrats, encaissez des paiements en ligne et bénéficiez de l'assistance IA pour développer votre activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Accéder au dashboard
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Commencer gratuitement
                    <ArrowRight size={20} className="ml-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-600">
              Une suite complète d'outils pour les freelances et PME
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <FileText className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Factures Pro</h3>
              <p className="text-gray-600">
                Créez des factures professionnelles en quelques clics. Export PDF et suivi des paiements.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <FileCheck className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contrats Intelligents</h3>
              <p className="text-gray-600">
                Générez des contrats personnalisés avec l'aide de l'IA. Clauses professionnelles incluses.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <DollarSign className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paiement en Ligne</h3>
              <p className="text-gray-600">
                Acceptez les paiements par Mobile Money, carte bancaire et wallet. Sécurisé avec FeexPay.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Bot className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assistant IA</h3>
              <p className="text-gray-600">
                ChatGPT et Claude à votre service pour vous assister dans toutes vos tâches administratives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-white text-opacity-90">Sécurisé</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white text-opacity-90">Disponible</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-lg">
              <div className="text-4xl font-bold text-white mb-2">+1000</div>
              <div className="text-white text-opacity-90">Utilisateurs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prêt à simplifier votre gestion ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Rejoignez des centaines de freelances qui nous font confiance
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all text-lg"
            >
              Créer mon compte gratuit
              <ArrowRight size={24} className="ml-2" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}