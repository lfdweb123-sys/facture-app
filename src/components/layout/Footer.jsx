import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-orange-500" size={24} />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                FreelancePro
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Solution complète de gestion pour freelances et PME. 
              Factures, contrats et paiements simplifiés.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/invoices" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Factures
                </Link>
              </li>
              <li>
                <Link to="/contracts" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Contrats
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 text-sm">Création de factures</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Génération de contrats</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Paiement en ligne</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Assistant IA</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>contact@freelancepro.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>+229 97 00 00 00</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>Cotonou, Bénin</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FreelancePro. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}