import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  ClipboardCheck
} from "lucide-react";

export default function Sidebar({ role }) {

  const menus = {
    admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Utilisateurs", path: "/admin/users", icon: Users },
      { name: "Projets", path: "/admin/projects", icon: FolderKanban }
    ],

    student: [
      { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { name: "Mon projet", path: "/student/project", icon: FolderKanban },
      { name: "Livrables", path: "/student/deliverables", icon: FileText }
    ],

    supervisor: [
      { name: "Dashboard", path: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "Projets", path: "/supervisor/projects", icon: FolderKanban },
      { name: "Évaluations", path: "/supervisor/evaluations", icon: ClipboardCheck }
    ]
  };

  const links = menus[role] || [];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">PROJEX</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">

        {links.map((link, index) => {

          const Icon = link.icon;

          return (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition 
                ${isActive ? "bg-blue-600" : "hover:bg-slate-800"}`
              }
            >
              <Icon size={20} />
              {link.name}
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
}