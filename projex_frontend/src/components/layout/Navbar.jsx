import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Search, Menu, Calendar, Check, Trash2 } from "lucide-react";
import { formatFileUrl } from '../../utils/file';
import notificationService from "../../services/notificationService";
import { Link } from "react-router-dom";

export default function Navbar({ user, onMenuClick, pageTitle }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    console.log("Fetching notifications...");
    try {
      const res = await notificationService.getNotifications();
      console.log("Notifications received:", res);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Listen for custom event from Notifications page
    window.addEventListener('notificationsUpdated', fetchNotifications);
    
    // Polling every 30 seconds for real-time-like updates
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', fetchNotifications);
    };
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm relative">
      {/* Left section: Title/Mobile Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-black text-[#0B1C3F] truncate max-w-[200px] sm:max-w-none tracking-tight">
          {pageTitle || "Tableau de bord"}
        </h2>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4AA8]/20 focus:border-[#1E4AA8] transition-all"
          />
        </div>
      </div>

      {/* Right section: Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative p-2 rounded-full transition-all duration-300 ${
              showDropdown ? 'bg-[#1E4AA8] text-white shadow-lg shadow-[#1E4AA8]/30' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Bell className={`h-5 w-5 ${showDropdown ? 'animate-none' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white ring-1 ring-red-500/20 shadow-sm transition-transform duration-300 scale-110">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                <h3 className="font-bold text-[#0B1C3F]">Notifications</h3>
                <Link 
                  to="/notifications" 
                  onClick={() => setShowDropdown(false)}
                  className="text-xs font-bold text-[#1E4AA8] hover:text-[#0B1C3F] transition-colors"
                >
                  Voir tout
                </Link>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id}
                        className={`p-4 hover:bg-slate-50 transition-colors group relative ${!n.is_read ? 'bg-[#1E4AA8]/5' : ''}`}
                      >
                        <Link 
                           to={n.link_url || '#'} 
                           onClick={() => {
                             if (!n.is_read) notificationService.markAsRead(n.id).then(fetchNotifications);
                             setShowDropdown(false);
                           }}
                           className="flex gap-3"
                        >
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-[#1E4AA8] text-white'
                          }`}>
                            <Bell size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${n.is_read ? 'text-slate-600' : 'text-[#0B1C3F]'}`}>
                              {n.titre}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                <Calendar size={10} />
                                {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Date inconnue'}
                              </span>
                              {!n.is_read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1E4AA8]"></span>
                              )}
                            </div>
                          </div>
                        </Link>
                        {!n.is_read && (
                          <button 
                            onClick={(e) => markAsRead(n.id, e)}
                            className="absolute top-4 right-4 h-6 w-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#1E4AA8] hover:border-[#1E4AA8] opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            title="Marquer comme lu"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={async () => {
                      await notificationService.markAllAsRead();
                      fetchNotifications();
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#1E4AA8] uppercase tracking-widest transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden xs:block"></div>

        <button className="flex items-center gap-3 p-1 sm:pr-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm overflow-hidden">
          <img
            src={user?.image_profil ? formatFileUrl(user.image_profil) : `https://ui-avatars.com/api/?name=${user?.prenom}+${user?.nom}&background=1E4AA8&color=fff`}
            alt={`${user?.prenom} ${user?.nom}`}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-700 leading-none">
              {user?.prenom} {user?.nom}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 leading-none font-bold uppercase tracking-wider">
              {user?.role?.replace('_', ' ').toLowerCase() || 'Utilisateur'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}