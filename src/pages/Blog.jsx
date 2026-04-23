import { ArrowRight, Calendar, User } from 'lucide-react';

export default function Blog() {
  const articles = [
    { title: 'Comment créer une facture professionnelle en 2 minutes', author: 'Équipe Facture App', date: '15 Avril 2026', excerpt: 'Découvrez les bonnes pratiques pour créer des factures conformes et professionnelles.' },
    { title: '5 conseils pour gérer votre trésorerie de freelance', author: 'Équipe Facture App', date: '10 Avril 2026', excerpt: 'Optimisez votre trésorerie avec nos conseils pratiques pour indépendants.' },
    { title: 'L\'IA au service des freelances : guide complet', author: 'Équipe Facture App', date: '5 Avril 2026', excerpt: 'Comment l\'intelligence artificielle peut vous aider à automatiser vos tâches administratives.' },
    { title: 'Pourquoi vérifier son identité sur une plateforme freelance ?', author: 'Équipe Facture App', date: '1 Avril 2026', excerpt: 'La vérification renforce la confiance entre freelances et clients.' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog</h1>
        <p className="text-xs text-gray-500 mt-0.5">Conseils et actualités pour freelances et PME</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((a, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group cursor-pointer">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-gray-700">{a.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{a.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
              <span className="flex items-center gap-1"><User size={11} />{a.author}</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
              Lire <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}