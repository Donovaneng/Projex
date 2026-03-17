import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function ProjectChat({ projectId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/messages`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await api.post(`/projects/${projectId}/messages`, { message: newMessage });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] border-slate-200 overflow-hidden bg-white rounded-3xl shadow-xl shadow-slate-200/50">
      <Card.Header className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1E4AA8] text-white">
               <MessageSquare size={18} />
            </div>
            <div>
               <h3 className="font-black text-[#0B1C3F] text-sm uppercase tracking-tight">Discussion du Projet</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{messages.length} messages échangés</p>
            </div>
         </div>
      </Card.Header>

      <Card.Content className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400 italic text-sm">Chargement de la discussion...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-50">
             <MessageSquare size={40} />
             <p className="text-xs font-bold uppercase tracking-widest">Commencez la discussion</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = Number(m.sender_id) === Number(currentUser.id);
            return (
              <div key={m.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <p className="text-[10px] font-black text-slate-400 ml-1 uppercase">
                      {m.prenom && m.nom ? `${m.prenom} ${m.nom}` : 'Utilisateur inconnu'} • {m.role || 'Ancien membre'}
                    </p>
                  )}
                  <div className={`p-3 rounded-2xl shadow-sm text-sm font-medium ${
                    isMe 
                    ? 'bg-gradient-to-br from-blue-500 to-[#1E4AA8] text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-[#0B1C3F] rounded-tl-none'
                  }`}>
                    {m.message}
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] text-slate-300 font-bold px-1`}>
                    <Clock size={8} /> {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card.Content>

      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#1E4AA8]/5 focus:border-[#1E4AA8]/30 transition-all font-medium"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="bg-[#1E4AA8] hover:bg-[#1E4AA8]/90 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </Card>
  );
}
