import { HelpCircle, MessageCircle, Book, Video, FileText } from 'lucide-react';

export default function Help() {
  const sections = [
    { icon: Book, title: 'Guide de démarrage', desc: 'Apprenez les bases de Facture App en quelques minutes.', link: '#' },
    { icon: Video, title: 'Tutoriels vidéo', desc: 'Des vidéos pas à pas pour maîtriser toutes les fonctionnalités.', link: '#' },
    { icon: FileText, title: 'FAQ', desc: 'Les réponses aux questions les plus fréquentes.', link: '#' },
    { icon: MessageCircle, title: 'Contacter le support', desc: 'Notre équipe est disponible pour vous aider.', link: 'mailto:support@factureapp.com' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Aide & Support</h1>
        <p className="text-xs text-gray-500 mt-0.5">Tout ce dont vous avez besoin pour utiliser Facture App</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((s, i) => (
          <a key={i} href={s.link} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <s.icon size={20} className="text-gray-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          </a>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <HelpCircle size={32} className="text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Vous ne trouvez pas votre réponse ?</h3>
        <p className="text-sm text-gray-500 mb-4">Notre équipe support vous répond sous 24h</p>
        <a href="mailto:support@factureapp.com" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 inline-flex items-center gap-2">
          <MessageCircle size={14} /> support@factureapp.com
        </a>
      </div>
    </div>
  );
}