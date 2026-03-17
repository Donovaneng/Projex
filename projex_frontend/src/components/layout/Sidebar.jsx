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
  X
} from "lucide-react";
import logo from "../../assets/projex.png";
import { useAuth } from "../../hooks/useAuth";
import { formatFileUrl } from "../../utils/file";

export default function Sidebar({ role, isOpen, onClose }) {
  const { logout } = useAuth();

  const menus = {
    admin: [
      { name: "Tableau de Bord", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Utilisateurs", path: "/admin/users", icon: Users },
      { name: "Projets", path: "/admin/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/admin/evaluations", icon: ClipboardCheck },
      { name: "Livrables", path: "/admin/deliverables", icon: FileText },
      { name: "Soutenances", path: "/admin/soutenances", icon: GraduationCap },
      { name: "Config Système", path: "/admin/settings", icon: Settings },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],

    student: [
      { name: "Tableau de Bord", path: "/student/dashboard", icon: LayoutDashboard },
      { name: "Mes Projets", path: "/student/projects", icon: FolderKanban },
      { name: "Mes Tâches", path: "/student/tasks", icon: ClipboardCheck },
      { name: "Livrables", path: "/student/deliverables", icon: FileText },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],

    supervisor: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
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
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ETUDIANT: [
      { name: "Tableau de Bord", path: "/student/dashboard", icon: LayoutDashboard },
      { name: "Mes Projets", path: "/student/projects", icon: FolderKanban },
      { name: "Mes Tâches", path: "/student/tasks", icon: ClipboardCheck },
      { name: "Livrables", path: "/student/deliverables", icon: FileText },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ENCADREUR_ACAD: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
      { name: "Soutenances", path: "/supervisor/soutenances", icon: GraduationCap },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ],
    ENCADREUR_PRO: [
      { name: "Tableau de Bord", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck },
      { name: "Soutenances", path: "/supervisor/soutenances", icon: GraduationCap },
      { name: "Notifications", path: "/notifications", icon: Bell }
    ]
  };

  const links = menus[role] || menus[role?.toUpperCase()] || [];

  return (
    <aside className={`
      fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 h-screen flex flex-col shadow-2xl select-none z-30
      transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 lg:shadow-sm lg:w-64
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Header Logo & Close button for mobile */}
      <div className="h-16 flex items-center justify-between border-b border-slate-100 px-6 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className=" bg-[#1E4AA8]/5 rounded-xl flex items-center justify-center">
            <img src={logo} alt="L" className="h-10 w-auto" />
          </div>

        </div>
        
        <button 
          onClick={onClose}
          className="p-2 lg:hidden text-slate-400 hover:text-[#1E4AA8] hover:bg-[#1E4AA8]/10 rounded-xl transition-all duration-200"
          aria-label="Cerrer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu Principal
        </p>

        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#1E4AA8]/10 text-[#1E4AA8] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1C3F]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-[#1E4AA8]" : "text-slate-400 group-hover:text-[#1E4AA8]"
                    }`}
                  />
                  <span className="text-[15px]">{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile Area */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* Profile Card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="h-10 w-10 rounded-full bg-[#1E4AA8] flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm">
            {useAuth().user?.image_profil ? (
              <img 
                src={formatFileUrl(useAuth().user.image_profil)} 
                className="h-full w-full object-cover" 
                alt="" 
              />
            ) : (
              <Users className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0B1C3F] truncate">
              {useAuth().user?.prenom} {useAuth().user?.nom}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
              {useAuth().user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#1E4AA8]/10 text-[#1E4AA8] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1C3F]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={`h-5 w-5 transition-colors ${isActive ? "text-[#1E4AA8]" : "text-slate-400 group-hover:text-[#1E4AA8]"}`} />
                  <span className="text-[15px]">Paramètres</span>
                </>
              )}
          </NavLink>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium group"
          >
            <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
            <span className="text-[15px]">Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}