import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardList,
  FileText,
  Bell,
  Star,
  CheckCircle2,
} from "lucide-react";

export const ROLES = {
  ADMIN: "ADMIN",
  ETUDIANT: "ETUDIANT",
  ENCADREUR_ACAD: "ENCADREUR_ACAD",
  ENCADREUR_PRO: "ENCADREUR_PRO",
};

export const MENU_BY_ROLE = {
  ADMIN: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Utilisateurs", path: "/admin/users", icon: Users },
    { label: "Projets", path: "/admin/projects", icon: FolderKanban },
    { label: "Affectations", path: "/admin/assignments", icon: ClipboardList },
    { label: "Validations", path: "/admin/validations", icon: CheckCircle2 },
    { label: "Notifications", path: "/admin/notifications", icon: Bell },
  ],

  ETUDIANT: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Mon projet", path: "/student/project", icon: FolderKanban },
    { label: "Tâches", path: "/student/tasks", icon: ClipboardList },
    { label: "Livrables", path: "/student/deliverables", icon: FileText },
    { label: "Évaluations", path: "/student/evaluations", icon: Star },
    { label: "Notifications", path: "/student/notifications", icon: Bell },
  ],

  ENCADREUR_ACAD: [
    { label: "Dashboard", path: "/supervisor", icon: LayoutDashboard },
    { label: "Projets suivis", path: "/supervisor/projects", icon: FolderKanban },
    { label: "Commentaires", path: "/supervisor/reviews", icon: FileText },
    { label: "Évaluations", path: "/supervisor/evaluations", icon: Star },
    { label: "Notifications", path: "/supervisor/notifications", icon: Bell },
  ],

  ENCADREUR_PRO: [
    { label: "Dashboard", path: "/supervisor", icon: LayoutDashboard },
    { label: "Projets suivis", path: "/supervisor/projects", icon: FolderKanban },
    { label: "Commentaires", path: "/supervisor/reviews", icon: FileText },
    { label: "Évaluations", path: "/supervisor/evaluations", icon: Star },
    { label: "Notifications", path: "/supervisor/notifications", icon: Bell },
  ],
};