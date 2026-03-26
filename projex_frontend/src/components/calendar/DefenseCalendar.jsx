import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
// Removed motion import to satisfy lint
import Card from '../ui/Card';

export default function DefenseCalendar({ soutenances, onSelectDate, onSelectDefense }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDefensesForDay = (day) => {
    return soutenances.filter(s => isSameDay(new Date(s.date_soutenance), day));
  };

  return (
    <Card className="border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
      <Card.Header className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
        <div className="flex items-center gap-4">
           <div className="p-3 rounded-2xl bg-[#1E4AA8] text-white shadow-lg shadow-blue-500/20">
              <Calendar size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-[#0B1C3F] tracking-tight capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Planning des soutenances</p>
           </div>
        </div>
        
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all active:scale-95 text-[#1E4AA8]"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#1E4AA8] transition-colors"
          >
            Aujourd'hui
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all active:scale-95 text-[#1E4AA8]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Card.Header>

      <Card.Content className="p-0">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {days.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px]">
          {calendarDays.map((day) => {
            const dayDefenses = getDefensesForDay(day);
            const isSelectedMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()} 
                className={`border-r border-b border-slate-50 p-3 transition-all relative group h-full ${
                  !isSelectedMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-blue-50/30'
                }`}
                onClick={() => onSelectDate?.(day)}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-sm font-black transition-colors ${
                     !isSelectedMonth ? 'text-slate-300' : 
                     isToday ? 'text-[#1E4AA8] bg-blue-100 w-7 h-7 flex items-center justify-center rounded-lg shadow-sm shadow-blue-500/10' : 'text-[#0B1C3F]'
                   }`}>
                     {format(day, 'd')}
                   </span>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[75px] custom-scrollbar pb-1">
                  {dayDefenses.map(def => (
                    <div 
                      key={def.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDefense?.(def);
                      }}
                      className="p-1.5 rounded-lg bg-[#1E4AA8] text-white text-[9px] font-bold leading-tight cursor-pointer shadow-md shadow-blue-500/10 hover:brightness-110 active:scale-[0.98] transition-all truncate"
                    >
                      {format(new Date(def.date_soutenance), 'HH:mm')} • {def.projet_titre}
                    </div>
                  ))}
                </div>
                
                {isSelectedMonth && (
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-5 h-5 rounded-lg bg-[#1E4AA8]/10 text-[#1E4AA8] flex items-center justify-center">
                         <Plus size={12} />
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </Card.Content>
      
      <div className="p-6 bg-slate-50/30 flex items-center justify-center gap-8 border-t border-slate-100">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1E4AA8]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soutenance planifiée</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aujourd'hui</span>
         </div>
      </div>
    </Card>
  );
}

function Plus({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
