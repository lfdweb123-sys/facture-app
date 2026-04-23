import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { askChatGPT, askClaude } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, Sparkles, Bot, User, Loader, RefreshCw, Copy, 
  MessageSquare, Plus, Trash2, Clock, ChevronLeft, ChevronRight,
  Search, X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('chatgpt');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchHistory, setSearchHistory] = useState('');
  const messagesEndRef = useRef(null);

  // Charger l'historique des conversations
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setConversations(convs);
      
      // Charger la dernière conversation active
      if (convs.length > 0 && !activeConversation) {
        setActiveConversation(convs[0]);
        setMessages(convs[0].messages || []);
      } else if (convs.length === 0) {
        // Message de bienvenue
        setMessages([{
          role: 'assistant',
          content: `Bonjour ${user?.displayName?.split(' ')[0] || ''} ! Je suis votre assistant Facture App. Je peux vous aider à créer des factures, rédiger des contrats, ou répondre à vos questions.`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Créer une nouvelle conversation
  const newConversation = async () => {
    const newConv = {
      title: 'Nouvelle discussion',
      userId: user.uid,
      messages: [{
        role: 'assistant',
        content: `Bonjour ${user?.displayName?.split(' ')[0] || ''} ! Comment puis-je vous aider ?`,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model
    };

    try {
      const docRef = await addDoc(collection(db, 'conversations'), newConv);
      const conv = { id: docRef.id, ...newConv };
      setConversations(prev => [conv, ...prev]);
      setActiveConversation(conv);
      setMessages(conv.messages);
      setShowHistory(false);
    } catch (error) {
      toast.error('Erreur création conversation');
    }
  };

  // Sauvegarder les messages
  const saveConversation = async (convId, msgs) => {
    try {
      // Mettre à jour le titre avec le premier message utilisateur
      const firstUserMsg = msgs.find(m => m.role === 'user');
      const title = firstUserMsg 
        ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '')
        : 'Nouvelle discussion';

      await updateDoc(doc(db, 'conversations', convId), {
        messages: msgs,
        title,
        updatedAt: new Date().toISOString(),
        model
      });

      // Mettre à jour la liste locale
      setConversations(prev => prev.map(c => 
        c.id === convId ? { ...c, messages: msgs, title, updatedAt: new Date().toISOString() } : c
      ));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  // Supprimer une conversation
  const deleteConversation = async (convId) => {
    try {
      await deleteDoc(doc(db, 'conversations', convId));
      setConversations(prev => prev.filter(c => c.id !== convId));
      
      if (activeConversation?.id === convId) {
        setActiveConversation(null);
        setMessages([{
          role: 'assistant',
          content: 'Sélectionnez une conversation ou créez-en une nouvelle.',
          timestamp: new Date().toISOString()
        }]);
      }
      toast.success('Conversation supprimée');
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  // Changer de conversation
  const switchConversation = (conv) => {
    setActiveConversation(conv);
    setMessages(conv.messages || []);
    setShowHistory(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Créer une conversation si pas active
    let convId = activeConversation?.id;
    if (!convId) {
      const newConv = {
        title: input.substring(0, 50),
        userId: user.uid,
        messages: newMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model
      };
      const docRef = await addDoc(collection(db, 'conversations'), newConv);
      convId = docRef.id;
      const conv = { id: docRef.id, ...newConv };
      setConversations(prev => [conv, ...prev]);
      setActiveConversation(conv);
    }

    try {
      let response;
      const context = 'Tu es un assistant professionnel pour Facture App. Aide à créer des factures, contrats, conseils freelance. Sois concis.';
      if (model === 'chatgpt') response = await askChatGPT(input, context);
      else response = await askClaude(input, context);

      const assistantMsg = { role: 'assistant', content: response, model, timestamp: new Date().toISOString() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      await saveConversation(convId, finalMessages);
    } catch {
      toast.error('Erreur IA');
      const errorMsg = { role: 'assistant', content: 'Désolé, une erreur est survenue.', error: true, timestamp: new Date().toISOString() };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      await saveConversation(convId, finalMessages);
    } finally { setLoading(false); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Conversation réinitialisée.',
      timestamp: new Date().toISOString()
    }]);
    setActiveConversation(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  const filteredConversations = conversations.filter(c =>
    c.title?.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-[80vh]">
        
        {/* Sidebar historique - Desktop */}
        <div className={`hidden lg:flex flex-col border-r border-gray-100 w-72 flex-shrink-0 ${showHistory ? 'lg:flex' : 'lg:flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <button onClick={newConversation}
              className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <Plus size={16} /> Nouvelle discussion
            </button>
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchHistory}
                onChange={e => setSearchHistory(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none"
              />
              {searchHistory && (
                <button onClick={() => setSearchHistory('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader className="animate-spin text-gray-400" size={20} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Aucune discussion</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map(conv => (
                  <div key={conv.id}
                    onClick={() => switchConversation(conv)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all ${
                      activeConversation?.id === conv.id
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{conv.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {conv.updatedAt ? format(new Date(conv.updatedAt), 'dd/MM HH:mm') : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle historique */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="lg:hidden absolute left-4 top-4 z-10 bg-white border border-gray-200 p-2 rounded-lg shadow-sm"
        >
          {showHistory ? <ChevronRight size={16} /> : <MessageSquare size={16} />}
        </button>

        {/* Chat principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-gray-900 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate">
                  {activeConversation?.title || 'Assistant IA'}
                </h1>
                <p className="text-xs text-gray-400">{model === 'chatgpt' ? 'ChatGPT' : 'Claude'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1.5 text-xs focus:outline-none appearance-none cursor-pointer"
              >
                <option value="chatgpt" className="text-gray-900">ChatGPT</option>
                <option value="claude" className="text-gray-900">Claude</option>
              </select>
              <button onClick={clearChat} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <RefreshCw size={14} />
              </button>
              {/* Mobile new chat */}
              <button onClick={newConversation} className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[90%] sm:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-900' : msg.error ? 'bg-red-100' : 'bg-white border border-gray-200'
                  }`}>
                    {msg.role === 'user' 
                      ? <User size={14} className="text-white" />
                      : <Bot size={14} className={msg.error ? 'text-red-500' : 'text-gray-600'} />
                    }
                  </div>
                  <div className={`min-w-0 rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : msg.error
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 gap-2">
                      <span className="text-xs opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && !msg.error && (
                        <button onClick={() => copyToClipboard(msg.content)} className="opacity-50 hover:opacity-100">
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <Loader className="animate-spin text-gray-600" size={14} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-900 outline-none"
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Overlay mobile historique */}
        {showHistory && (
          <div className="lg:hidden fixed inset-0 z-20">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Discussions</h3>
                <button onClick={() => setShowHistory(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={16} />
                </button>
              </div>
              <div className="p-3">
                <button onClick={() => { newConversation(); setShowHistory(false); }}
                  className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <Plus size={16} /> Nouvelle discussion
                </button>
              </div>
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchHistory} onChange={e => setSearchHistory(e.target.value)}
                    placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 outline-none" />
                </div>
              </div>
              <div className="p-2 space-y-1">
                {filteredConversations.map(conv => (
                  <div key={conv.id}
                    onClick={() => switchConversation(conv)}
                    className={`p-3 rounded-xl cursor-pointer ${activeConversation?.id === conv.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{conv.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{conv.updatedAt ? format(new Date(conv.updatedAt), 'dd/MM HH:mm') : ''}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}