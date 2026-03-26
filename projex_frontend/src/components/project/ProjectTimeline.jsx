import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, FileText, Award, Clock, ArrowUpRight, 
  Calendar, ListTodo, AlertCircle 
} from 'lucide-react';
import Card from '../ui/Card';
import Loader from '../ui/Loader';

const ProjectTimeline = ({ projectId, service }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await service.getProjectTimeline(projectId);
        setEvents(response.timeline || []);
      } catch (err) {
        console.error("Erreur timeline:", err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchTimeline();
  }, [projectId, service]);

  if (loading) return <div className="py-8"><Loader size="sm" text="Chargement du journal..." /></div>;

  const getIcon = (type) => {
    switch (type) {
      case 'LIVRABLE': return <FileText className="text-blue-500" size={16} />;
      case 'EVALUATION': return <Award className="text-purple-500" size={16} />;
      case 'TASK': return <ListTodo className="text-emerald-500" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const getBadgeColor = (type, meta) => {
    if (type === 'TASK') {
        return meta === 'TERMINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
    }
    if (type === 'LIVRABLE') {
        return meta === 'VALIDE' ? 'bg-green-100 text-green-700' : 
               meta === 'REJETE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
    }
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <Card.Header className="bg-slate-50 p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-3">
          <Calendar className="text-[#1E4AA8]" size={20} />
          Chronologie du Projet
        </h2>
      </Card.Header>
      <Card.Content className="p-6">
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {events.length > 0 ? (
            events.map((event, idx) => (
              <div key={`${event.type}-${event.id}`} className="relative flex items-start gap-6 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="absolute left-0 w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center z-10 mt-1">
                  {getIcon(event.type)}
                </div>
                <div className="flex-1 ml-12 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-hover hover:border-[#1E4AA8]/20 hover:bg-white hover:shadow-md">
                   <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getBadgeColor(event.type, event.meta)}`}>
                        {event.type}
                      </span>
                      <time className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                   </div>
                   <h3 className="font-bold text-sm text-[#0B1C3F]">{event.label}</h3>
                   {event.meta && (
                     <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={10} /> Statut : <span className="font-bold">{event.meta?.replace('_', ' ')}</span>
                     </p>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 opacity-40">
               <AlertCircle size={40} className="mx-auto mb-3" />
               <p className="text-sm font-bold uppercase tracking-widest">Aucun événement enregistré</p>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default ProjectTimeline;
