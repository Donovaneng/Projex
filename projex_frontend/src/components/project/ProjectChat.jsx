import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, MessageSquare, Paperclip, FileText, ImageIcon, Download, Check, CheckCheck, X } from 'lucide-react';
import api from '../../services/api';
import { formatFileUrl } from '../../utils/file';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function ProjectChat({ projectId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const interval = setInterval(loadMessages, 4000); // Polling every 4s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('message', newMessage);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post(`/projects/${projectId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setNewMessage('');
      setSelectedFile(null);
      loadMessages();
    } catch (err) {
      console.error("Send error:", err);
      const errorMsg = err.response?.data?.error || "Erreur lors de l'envoi";
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Helper to group messages by date
  const groupMessages = (msgs) => {
    const groups = {};
    msgs.forEach(m => {
      const date = new Date(m.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  };

  const messageGroups = groupMessages(messages);

  return (
    <Card className="flex flex-col h-[600px] border-slate-200 overflow-hidden bg-white rounded-[2rem] shadow-2xl shadow-slate-200/40">
      <Card.Header className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-[#1E4AA8] text-white shadow-lg shadow-blue-500/20">
                <MessageSquare size={20} />
             </div>
             <div>
                <h3 className="font-black text-[#0B1C3F] text-base tracking-tight uppercase">Discussion Collaborative</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {messages.length} messages sécurisés
                </p>
             </div>
          </div>
      </Card.Header>

      <Card.Content className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400 italic text-sm">Synchronisation en cours...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-3 opacity-60">
             <div className="p-6 bg-white rounded-full shadow-inner">
               <MessageSquare size={48} />
             </div>
             <p className="text-xs font-black uppercase tracking-[0.2em]">Aucun message pour le moment</p>
          </div>
        ) : (
          Object.keys(messageGroups).map(date => (
            <div key={date} className="space-y-6">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  {date === new Date().toLocaleDateString() ? "Aujourd'hui" : date}
                </span>
              </div>
              {messageGroups[date].map((m) => {
                const isMe = Number(m.sender_id) === Number(currentUser.id);
                const isImage = m.type === 'image';
                const isFile = m.type === 'file';

                return (
                  <div key={m.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && (
                        <p className="text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-tighter">
                          {m.prenom} {m.nom} • <span className="text-blue-500">{m.role?.replace('ENCADREUR_', '')}</span>
                        </p>
                      )}
                      
                      <div className={`relative p-3.5 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                        isMe 
                        ? 'bg-[#1E4AA8] text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-100 text-[#0B1C3F] rounded-tl-sm'
                      }`}>
                        
                        {/* File/Image Content */}
                        {isImage && m.file_path && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20 shadow-inner">
                             <img src={formatFileUrl(m.file_path)} alt="Attached" className="max-h-64 object-cover cursor-pointer hover:scale-105 transition-transform" />
                          </div>
                        )}

                        {isFile && m.file_path && (
                          <a 
                            href={formatFileUrl(m.file_path)} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`flex items-center gap-3 p-3 mb-2 rounded-xl border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-[#0B1C3F]'} group/file`}
                          >
                             <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-white shadow-sm font-bold text-blue-600'}`}>
                                <FileText size={18} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold truncate">Document partagé</p>
                                <p className="text-[9px] opacity-60">Cliquer pour télécharger</p>
                             </div>
                             <Download size={14} className="opacity-0 group-hover/file:opacity-100 transition-opacity" />
                          </a>
                        )}

                        <p className={`text-sm leading-relaxed ${isMe ? 'font-medium' : 'font-semibold'}`}>
                          {m.message}
                        </p>

                        {/* Read/Status indicator */}
                        <div className={`absolute -bottom-5 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                           <span className="text-[9px] text-slate-400 font-black uppercase italic tracking-tighter">
                             {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isMe && (
                             m.is_read 
                             ? <CheckCheck size={12} className="text-blue-500" />
                             : <Check size={12} className="text-slate-300" />
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </Card.Content>

      <div className="p-6 border-t border-slate-100 bg-white">
        {selectedFile && (
          <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="p-2 bg-white rounded-xl shadow-sm border border-blue-100 text-blue-600 font-bold">
                 {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
               </div>
               <span className="text-xs font-bold text-blue-700 truncate">{selectedFile.name}</span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 px-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-3 bg-slate-50 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded-2xl transition-all active:scale-95 border border-slate-100 shadow-sm"
            title="Joindre un fichier"
          >
            <Paperclip size={20} />
          </button>
          
          <input 
            type="text" 
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-4 focus:ring-[#1E4AA8]/5 focus:border-[#1E4AA8]/40 transition-all font-semibold placeholder:text-slate-300"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          
          <button 
            type="submit" 
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className="bg-gradient-to-br from-blue-600 to-[#1E4AA8] hover:shadow-blue-500/40 text-white px-5 rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center font-black"
          >
            <Send size={20} className={sending ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>
    </Card>
  );
}
