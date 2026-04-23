import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { askChatGPT } from '../../services/ai';
import toast from 'react-hot-toast';
import { FileCheck, Wand2, Save, Loader } from 'lucide-react';

export default function ContractForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    type: 'service',
    startDate: '',
    endDate: '',
    amount: '',
    description: '',
    terms: '',
    aiGenerated: false
  });

  const contractTypes = [
    { value: 'service', label: 'Prestation de service' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'development', label: 'Développement' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Autre' }
  ];

  const generateWithAI = async () => {
    if (!formData.description || !formData.clientName) {
      toast.error('Veuillez remplir la description et le nom du client');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Génère un contrat professionnel de type ${formData.type} entre FreelancePro et ${formData.clientName}. 
      Description de la mission : ${formData.description}
      Montant : ${formData.amount} XOF
      Date de début : ${formData.startDate}
      Date de fin : ${formData.endDate}
      
      Inclus les clauses standards de confidentialité, propriété intellectuelle, conditions de paiement et résiliation.`;

      const aiResult = await askChatGPT(prompt, 'Tu es un expert juridique spécialisé dans la rédaction de contrats professionnels.');
      
      setFormData({
        ...formData,
        terms: aiResult,
        aiGenerated: true
      });

      toast.success('Contrat généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du contrat');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractRef = doc(collection(db, 'contracts'));
      await setDoc(contractRef, {
        ...formData,
        userId: user.uid,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      toast.success('Contrat créé avec succès !');
      navigate('/contracts');
    } catch (error) {
      toast.error('Erreur lors de la création du contrat');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Contrat</h1>
          <div className="flex items-center space-x-2 text-sm">
            <FileCheck className="text-blue-600" size={20} />
            <span className="text-gray-600">Contrat professionnel</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type de contrat */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Type de contrat</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contractTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.value})}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Informations générales */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du contrat
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Contrat de développement web"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du client
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (XOF)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de la mission
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Décrivez en détail la mission ou le projet..."
              required
            />
          </div>

          {/* Génération IA */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assistant IA</h3>
                <p className="text-sm text-gray-600">Générez automatiquement les termes du contrat</p>
              </div>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={generating}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Générer avec IA</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({...formData, terms: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              rows="12"
              placeholder="Les termes et conditions du contrat apparaîtront ici..."
            />
            {formData.aiGenerated && (
              <p className="text-xs text-purple-600 mt-2">
                ✨ Contenu généré par IA - Veuillez vérifier et ajuster si nécessaire
              </p>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Création du contrat...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Créer le contrat</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}