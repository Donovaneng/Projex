import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { Bell, Check, Trash2, Calendar, ClipboardList, FileCheck, MessageSquare, AlertCircle, Info, CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { Link } from 'react-router-dom';

const getIcon = (type) => {
  switch (type) {
    case 'LIVRABLE': return <FileCheck className="text-blue-500" />;
    case 'EVALUATION': return <CheckCircle2 className="text-green-500" />;
    case 'TASK': return <ClipboardList className="text-purple-500" />;
    case 'PROJET': return <Info className="text-[#1E4AA8]" />;
    case 'ALERTE': return <AlertCircle className="text-orange-500" />;
    default: return <Bell className="text-slate-400" />;
  }
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer toutes vos notifications ?")) return;
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  if (loading) return (
    <DashboardLayout pageTitle="Mes Notifications">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Chargement de vos notifications..." />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout pageTitle="Mes Notifications">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] tracking-tight">Notifications</h1>
            <p className="text-slate-500 mt-1">Gérez vos alertes et restez informé en temps réel.</p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs font-bold uppercase tracking-wider">
                <Check className="mr-2 h-4 w-4" />Tout marquer comme lu
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />Effacer tout
              </Button>
            )}
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-1">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-3 px-2 text-sm font-bold transition-all relative ${
              filter === 'all' ? 'text-[#1E4AA8]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Toutes ({notifications.length})
            {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4AA8] rounded-full"></div>}
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`pb-3 px-2 text-sm font-bold transition-all relative ${
              filter === 'unread' ? 'text-[#1E4AA8]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Non lues ({notifications.filter(n => !n.is_read).length})
            {filter === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4AA8] rounded-full"></div>}
          </button>
        </div>

        <div className="grid gap-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1C3F]">Aucune notification</h3>
              <p className="text-slate-400 mt-1 max-w-xs mx-auto">Vous êtes à jour ! Revenez plus tard pour voir les nouvelles activités.</p>
              <Button variant="outline" className="mt-8" onClick={loadNotifications}>Actualiser</Button>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`group p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                  n.is_read 
                    ? 'bg-white border-slate-100 opacity-80 hover:opacity-100' 
                    : 'bg-white border-[#1E4AA8]/10 shadow-lg shadow-[#1E4AA8]/5 ring-1 ring-[#1E4AA8]/5 hover:border-[#1E4AA8]/30'
                }`}
              >
                {!n.is_read && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1E4AA8]"></div>}
                
                <div className="flex gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                    n.is_read ? 'bg-slate-50 text-slate-400' : 'bg-[#1E4AA8]/10'
                  }`}>
                    {getIcon(n.entity_type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-base font-bold tracking-tight ${n.is_read ? 'text-slate-600' : 'text-[#0B1C3F]'}`}>
                          {n.titre}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            <Calendar size={12} className="text-slate-300" />
                            {n.created_at ? new Date(n.created_at).toLocaleString('fr-FR', { 
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            }) : 'Date inconnue'}
                          </span>
                          {!n.is_read && (
                            <span className="px-2 py-0.5 rounded-full bg-[#1E4AA8]/10 text-[#1E4AA8] text-[9px] font-black uppercase tracking-widest">
                              Nouveau
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                           onClick={() => deleteNotification(n.id)}
                           className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                           title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed max-w-2xl ${n.is_read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                      {n.message}
                    </p>

                    {n.link_url && (
                        <div className="pt-2">
                          <Link 
                            to={n.link_url} 
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-[#1E4AA8] hover:text-[#0B1C3F] transition-colors bg-[#1E4AA8]/5 px-3 py-1.5 rounded-full hover:bg-[#1E4AA8]/10"
                          >
                             Consulter l'élément <ExternalLink size={12} />
                          </Link>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
