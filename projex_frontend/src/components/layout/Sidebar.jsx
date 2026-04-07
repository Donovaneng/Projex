import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  ClipboardCheck,
  LogOut,
  Settings,
  Bell,
  GraduationCap,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import logo from "../../assets/projex.png";
import { useAuth } from "../../hooks/useAuth";
import { formatFileUrl } from "../../utils/file";

export default function Sidebar({ role, isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { logout, user } = useAuth();

  const menus = {
    admin: [
      { name: "Tableau de Bord", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Utilisateurs", path: "/admin/users", icon: Users },
      { name: "Projets", path: "/admin/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/admin/evaluations", icon: ClipboardCheck },
      { name: "Livrables", path: "/admin/deliverables", icon: FileText },
      { name: "Soutenances", path: "/admin/soutenances", icon: GraduationCap },
      { name: "Config Système", path: "/admin/settings", icon: Settings },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],

    student: [
      { name: "Tableau de Bord", path: "/student/dashboard", icon: LayoutDashboard },
      { name: "Mes Projets", path: "/student/projects", icon: FolderKanban },
      { name: "Mes Tâches", path: "/student/tasks", icon: ClipboardCheck },
      { name: "Livrables", path: "/student/deliverables", icon: FileText },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],

    supervisor: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Livrables", path: "/supervisor/deliverables", icon: FileText },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    // Fallback majuscule si data DB différente
    ADMIN: [
      { name: "Tableau de Bord", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Utilisateurs", path: "/admin/users", icon: Users },
      { name: "Projets", path: "/admin/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/admin/evaluations", icon: ClipboardCheck },
      { name: "Livrables", path: "/admin/deliverables", icon: FileText },
      { name: "Soutenances", path: "/admin/soutenances", icon: GraduationCap },
      { name: "Config Système", path: "/admin/settings", icon: Settings },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ETUDIANT: [
      { name: "Tableau de Bord", path: "/student/dashboard", icon: LayoutDashboard },
      { name: "Mes Projets", path: "/student/projects", icon: FolderKanban },
      { name: "Mes Tâches", path: "/student/tasks", icon: ClipboardCheck },
      { name: "Livrables", path: "/student/deliverables", icon: FileText },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ENCADREUR_ACAD: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Livrables", path: "/supervisor/deliverables", icon: FileText },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ENCADREUR_PRO: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Livrables", path: "/supervisor/deliverables", icon: FileText },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
      { name: "Messagerie", path: "/messages", icon: MessageSquare },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ]
  };

  const links = menus[role] || menus[role?.toUpperCase()] || [];

  return (
    <aside className={`
      fixed inset-y-0 left-0 bg-white border-r border-slate-200 h-screen flex flex-col shadow-2xl select-none z-40
      transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 lg:shadow-sm
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      ${isCollapsed ? "w-20" : "w-60 lg:w-64"}
    `}>
      {/* Header Logo & Close button */}
      <div className={`h-16 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white transition-all duration-500 ${isCollapsed ? 'px-2 flex-col py-1 h-auto space-y-1' : 'px-6 h-16'}`}>
        <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="bg-[#1E4AA8]/5 rounded-xl flex items-center justify-center shrink-0 p-1">
            <img src={logo} alt="L" className={`${isCollapsed ? 'h-6' : 'h-8'} w-auto`} />
          </div>
        </div>
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          {/* Desktop Toggle */}
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-[#1E4AA8]/10 rounded-lg transition-all duration-200"
            title={isCollapsed ? "Développer" : "Réduire"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close */}
          <button 
            onClick={onClose}
            className="p-2 lg:hidden text-slate-400 hover:text-[#1E4AA8] hover:bg-[#1E4AA8]/10 rounded-xl transition-all duration-200"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto py-6 space-y-1.5 scrollbar-hide transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-4'}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              title={isCollapsed ? link.name : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                  isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? "bg-[#1E4AA8]/10 text-[#1E4AA8] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1C3F]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? "text-[#1E4AA8]" : "text-slate-400 group-hover:text-[#1E4AA8]"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-[15px] truncate animate-in slide-in-from-left-2 duration-300">{link.name}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile Area */}
      <div className={`border-t border-slate-100 space-y-3 transition-all duration-500 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Profile Card */}
        <div className={`flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 ${isCollapsed ? 'p-2 justify-center' : 'px-3 py-2'}`}>
          <div className="h-10 w-10 rounded-full bg-[#1E4AA8] flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm">
            {user?.image_profil ? (
              <img 
                src={formatFileUrl(user.image_profil)} 
                className="h-full w-full object-cover" 
                alt="" 
              />
            ) : (
              <Users className="h-5 w-5 text-white" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-500">
              <p className="text-sm font-bold text-[#0B1C3F] truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <NavLink
              to="/settings"
              title={isCollapsed ? "Paramètres" : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                   isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? "bg-[#1E4AA8]/10 text-[#1E4AA8] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1C3F]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-[#1E4AA8]" : "text-slate-400 group-hover:text-[#1E4AA8]"}`} />
                  {!isCollapsed && <span className="text-[15px] animate-in fade-in duration-500">Paramètres</span>}
                </>
              )}
          </NavLink>

          <button 
            onClick={logout}
            title={isCollapsed ? "Déconnexion" : ""}
            className={`w-full flex items-center gap-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium group ${
              isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0 text-red-500 group-hover:text-red-600 transition-colors" />
            {!isCollapsed && <span className="text-[15px] animate-in fade-in duration-500">Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}