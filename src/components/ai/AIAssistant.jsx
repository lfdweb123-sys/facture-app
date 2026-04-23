import { useState } from 'react';
import { askChatGPT, askClaude } from '../../services/ai';
import { Sparkles, Send, Loader } from 'lucide-react';

export default function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState('chatgpt');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { role: 'user', content: message };
    setChat([...chat, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      let response;
      if (aiModel === 'chatgpt') {
        response = await askChatGPT(message);
      } else {
        response = await askClaude(message);
      }

      setChat(prev => [...prev, { role: 'assistant', content: response, model: aiModel }]);
    } catch (error) {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        error: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            Assistant IA
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setAiModel('chatgpt')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                aiModel === 'chatgpt' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ChatGPT
            </button>
            <button
              onClick={() => setAiModel('claude')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                aiModel === 'claude' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Claude
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <Sparkles size={48} className="mx-auto mb-4 text-orange-500" />
            <p>Posez-moi une question sur vos factures, contrats ou toute autre tâche !</p>
          </div>
        )}
        
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white'
                  : msg.error
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.model && (
                <p className="text-xs mt-1 opacity-70">
                  Réponse de {msg.model === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <Loader className="animate-spin text-orange-500" size={20} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-gradient-to-r from-orange-500 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}