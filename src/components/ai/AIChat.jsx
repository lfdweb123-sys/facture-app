import { useState, useRef, useEffect } from 'react';
import { askChatGPT, askClaude } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon,
  FileText,
  FileCheck,
  Calculator,
  Loader,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ${user?.displayName || '!'} Je suis votre assistant IA. Je peux vous aider à :
- Créer des factures professionnelles
- Rédiger des contrats
- Calculer des montants et taxes
- Conseiller sur la gestion de votre activité
- Répondre à vos questions sur FreelancePro

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('chatgpt');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (model === 'chatgpt') {
        response = await askChatGPT(input, 
          `Tu es un assistant professionnel pour FreelancePro, une application de gestion pour freelances et PME. 
          Tu aides à créer des factures, des contrats, et tu donnes des conseils professionnels.
          Sois concis, précis et professionnel.`
        );
      } else {
        response = await askClaude(input,
          `Tu es un assistant professionnel pour FreelancePro, une application de gestion pour freelances et PME. 
          Tu aides à créer des factures, des contrats, et tu donnes des conseils professionnels.
          Sois concis, précis et professionnel.`
        );
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        model,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Erreur lors de la communication avec l\'IA');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    toast.success('Conversation réinitialisée');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Texte copié !');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Assistant IA</h1>
                <p className="text-sm text-white text-opacity-90">Powered by ChatGPT & Claude</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="chatgpt" className="text-gray-900">ChatGPT-4</option>
                <option value="claude" className="text-gray-900">Claude-3</option>
              </select>
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Réinitialiser la conversation"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`p-2 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-blue-600'
                    : message.error
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon size={20} className="text-white" />
                  ) : (
                    <Bot size={20} className={message.error ? 'text-red-600' : 'text-blue-600'} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white'
                      : message.error
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {message.model && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Réponse générée par {message.model === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy size={14} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <ThumbsUp size={14} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-xl">
                  <Loader className="animate-spin text-blue-600" size={20} />
                </div>
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Posez votre question ou décrivez votre besoin..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows="2"
                disabled={loading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {model === 'chatgpt' ? 'GPT-4' : 'Claude-3'}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setInput(prev => prev + 'Génère une facture pour ')}
                className="inline-flex items-center space-x-1 text-xs text-gray-600 hover:text-orange-600 transition-colors"
              >
                <FileText size={12} />
                <span>Facture</span>
              </button>
              <button
                type="button"
                onClick={() => setInput(prev => prev + 'Rédige un contrat pour ')}
                className="inline-flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FileCheck size={12} />
                <span>Contrat</span>
              </button>
              <button
                type="button"
                onClick={() => setInput(prev => prev + 'Calcule le montant TTC pour ')}
                className="inline-flex items-center space-x-1 text-xs text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Calculator size={12} />
                <span>Calcul</span>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}