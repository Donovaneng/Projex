import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  User, 
  MessageCircle, 
  ShieldCheck, 
  Clock,
  AlertCircle,
  Search,
  ChevronRight,
  UserCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

export default function GlobalMessages() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/support/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
    }
  }, [isAdmin]);

  const loadMessages = useCallback(async (targetUserId = null) => {
    try {
      if (isAdmin && !targetUserId) {
        setMessages([]);
        return;
      }
      
      const params = targetUserId ? { params: { userId: targetUserId } } : {};
      const res = await api.get('/support', params);
      setMessages(res.data.messages || []);
      
      // If we just loaded messages, we should refresh conversations to update unread counts
      if (isAdmin) loadConversations();
    } catch (err) {
      console.error('Erreur chargement messages support:', err);
    } finally {
      setLoading(false);
      setMessagesLoading(false);
    }
  }, [isAdmin, loadConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAdmin) {
      loadConversations();
      const interval = setInterval(loadConversations, 15000);
      return () => clearInterval(interval);
    } else {
      loadMessages();
      const interval = setInterval(() => loadMessages(), 7000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, loadConversations, loadMessages]);

  useEffect(() => {
    if (selectedChat) {
      setMessagesLoading(true);
      loadMessages(selectedChat.user_id);
    }
  }, [selectedChat, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const payload = {
        message: newMessage,
        recipient_id: isAdmin ? selectedChat?.user_id : null
      };
      
      await api.post('/support', payload);
      
      setNewMessage('');
      loadMessages(isAdmin ? selectedChat?.user_id : null);
      if (isAdmin) loadConversations();
    } catch (err) {
      console.error("Erreur envoi message support:", err);
      alert("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Centre de Messagerie">
      <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-180px)]">
        
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#0B1C3F] flex items-center gap-3">
               <MessageCircle className="text-[#1E4AA8]" size={32} />
               Support <span className="text-[#1E4AA8]">{isAdmin ? 'Administrateur' : 'Global'}</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
              {isAdmin 
                ? "Gérez les demandes d'assistance des étudiants et des encadreurs." 
                : "Discutez directement avec l'administration pour toute question technique."}
            </p>
          </div>
          {isAdmin && (
            <div className="bg-blue-50 text-[#1E4AA8] px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100 italic">
               Mode Super-Admin Actif
            </div>
          )}
        </header>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white flex flex-row h-full">
          
          {/* Sidebar Admin */}
          {isAdmin && (
            <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
               <div className="p-6 border-b border-slate-100 bg-white">
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                       type="text" 
                       placeholder="Rechercher..."
                       className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-50 transition-all outline-none"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loading && !conversations.length ? (
                    <div className="p-10 flex justify-center"><Loader size="sm" /></div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic font-medium">
                       Aucune conversation trouvée.
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.user_id}
                        onClick={() => setSelectedChat(conv)}
                        className={`w-full p-5 flex items-start gap-4 transition-all border-b border-slate-50/50 hover:bg-white text-left group ${selectedChat?.user_id === conv.user_id ? 'bg-white shadow-sm border-l-4 border-l-[#1E4AA8]' : ''}`}
                      >
                         <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[#1E4AA8] font-black uppercase text-sm shadow-sm">
                               {conv.prenom[0]}{conv.nom[0]}
                            </div>
                            {conv.unread_count > 0 && (
                               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
                                  {conv.unread_count}
                               </span>
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                               <p className="text-xs font-black text-[#0B1C3F] truncate">{conv.prenom} {conv.nom}</p>
                               <span className="text-[8px] text-slate-400 font-bold uppercase shrink-0">
                                  {conv.last_message_date ? new Date(conv.last_message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                               </span>
                            </div>
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-tighter mb-1.5 opacity-60">
                               {conv.role?.replace('ENCADREUR_', '')}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate italic leading-none">
                               {conv.last_message || 'Fichier envoyé...'}
                            </p>
                         </div>
                      </button>
                    ))
                  )}
               </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#FDFDFF]">
            {isAdmin && !selectedChat ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                 <div className="p-8 bg-blue-50 text-[#1E4AA8] rounded-[2.5rem] shadow-inner">
                    <MessageCircle size={64} className="opacity-40" />
                 </div>
                 <div className="max-w-xs space-y-2">
                    <h3 className="text-xl font-black text-[#0B1C3F]">Sélectionnez une discussion</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                       Choisissez un utilisateur dans la liste de gauche pour voir ses messages et lui répondre.
                    </p>
                 </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-[#1E4AA8] text-white rounded-2xl shadow-lg shadow-blue-500/20">
                      {isAdmin ? <UserCircle2 size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0B1C3F]">
                         {isAdmin ? `${selectedChat.prenom} ${selectedChat.nom}` : 'Assistance PROJEX'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 
                        {isAdmin ? 'Discussion en cours' : 'Agent Admin en ligne'}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-[10px] text-slate-400 font-black uppercase bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 tracking-[0.1em]">
                    Canal Sécurisé AES-256
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {(loading && !isAdmin) || messagesLoading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <Loader size="md" />
                      <p className="text-xs font-black uppercase tracking-widest mt-4">Chargement sécurisé...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <div className="p-6 bg-slate-100 text-slate-400 rounded-full">
                        <MessageCircle size={40} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[.2em]">Aucun message</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = parseInt(m.sender_id) === parseInt(user.id);
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                              <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#1E4AA8] shadow-sm font-black text-[10px] uppercase shrink-0">
                                 {m.prenom?.[0]}{m.nom?.[0]}
                              </div>
                            )}
                            <div className={`space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className={`p-4 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                                isMe 
                                  ? 'bg-[#1E4AA8] text-white rounded-br-none' 
                                  : 'bg-white border border-slate-100 text-[#0B1C3F] rounded-bl-none'
                              }`}>
                                {m.message}
                              </div>
                              <div className="flex items-center gap-2 px-1">
                                 <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 {isMe && (
                                   m.is_read 
                                   ? <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Vu</span>
                                   : <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Envoyé</span>
                                 )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder={isAdmin ? `Répondre à ${selectedChat.prenom}...` : "Écrivez votre message ici..."}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100/30 focus:border-blue-200 transition-all placeholder:text-slate-300"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      autoComplete="off"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sending}
                      className="rounded-2xl bg-[#0B1C3F] hover:bg-[#1E4AA8] px-10 shadow-xl shadow-blue-900/10 h-[52px]"
                    >
                      {sending ? <Loader size="sm" color="white" /> : <Send size={20} />}
                    </Button>
                  </form>
                  <p className="text-[9px] text-slate-400 mt-4 text-center font-black uppercase tracking-widest opacity-60">
                     <AlertCircle size={10} className="inline mr-1 -mt-0.5" /> Chiffrement de bout en bout actif
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
