import { useState, useRef, useEffect } from 'react';
import { askChatGPT, askClaude } from '../../services/ai';
import { Sparkles, Send, Loader, User, Bot } from 'lucide-react';

export default function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState('chatgpt');
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = { role: 'user', content: message };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      let response;
      if (aiModel === 'chatgpt') {
        response = await askChatGPT(message, 'Tu es un assistant professionnel pour Facture App. Aide à créer des factures, contrats, et gérer une activité freelance.');
      } else {
        response = await askClaude(message, 'Tu es un assistant professionnel pour Facture App.');
      }
      setChat(prev => [...prev, { role: 'assistant', content: response, model: aiModel }]);
    } catch {
      setChat(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.', error: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-gray-900" />
            <h2 className="text-sm font-semibold text-gray-900">Assistant IA</h2>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setAiModel('chatgpt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aiModel==='chatgpt' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              ChatGPT
            </button>
            <button onClick={() => setAiModel('claude')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aiModel==='claude' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              Claude
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.length === 0 && (
          <div className="text-center py-16">
            <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Posez une question sur vos factures, contrats...</p>
          </div>
        )}
        
        {chat.map((msg, index) => (
          <div key={index} className={`flex ${msg.role==='user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role==='user' 
                ? 'bg-gray-900 text-white' 
                : msg.error ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.model && <p className="text-xs mt-1 opacity-60">{msg.model==='chatgpt'?'ChatGPT':'Claude'}</p>}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
              <Loader className="animate-spin text-gray-600" size={16} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !message.trim()}
            className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}