import {
  FolderKanban,
  FileUp,
  Clock3,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Bell,
} from "lucide-react";

export default function Dashboard() {
  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Bonjour"
      : hour >= 12 && hour < 18
      ? "Bon après-midi"
      : hour >= 18 && hour < 22
      ? "Bonsoir"
      : "Bonne nuit";

  const stats = [
    {
      title: "Projets actifs",
      value: "12",
      icon: FolderKanban,
      color: "bg-[#1E4AA8]",
      note: "+2 ce mois",
    },
    {
      title: "Livrables déposés",
      value: "28",
      icon: FileUp,
      color: "bg-emerald-500",
      note: "4 en attente",
    },
    {
      title: "Échéances proches",
      value: "5",
      icon: Clock3,
      color: "bg-amber-500",
      note: "Sous 7 jours",
    },
    {
      title: "Encadreurs liés",
      value: "3",
      icon: Users,
      color: "bg-violet-500",
      note: "Acad. & Pro",
    },
  ];

  const quickActions = [
    "Déposer un livrable",
    "Consulter mes projets",
    "Voir les échéances",
    "Mettre à jour mon profil",
  ];

  const recentProjects = [
    {
      title: "Application de gestion des stages",
      status: "En cours",
      progress: 72,
      supervisor: "M. Ndzi",
    },
    {
      title: "Plateforme de suivi académique",
      status: "Validation",
      progress: 90,
      supervisor: "Mme Ndzié",
    },
    {
      title: "Système de gestion de bibliothèque",
      status: "Démarrage",
      progress: 24,
      supervisor: "M. Tchoua",
    },
  ];

  const recentFiles = [
    {
      name: "rapport_version_2.pdf",
      project: "Gestion des stages",
      date: "Aujourd’hui",
      status: "Déposé",
    },
    {
      name: "maquette_dashboard.fig",
      project: "Suivi académique",
      date: "Hier",
      status: "En revue",
    },
    {
      name: "cahier_de_charge.docx",
      project: "Bibliothèque",
      date: "12 mars",
      status: "Validé",
    },
  ];

  const deadlines = [
    {
      title: "Remise du rapport intermédiaire",
      date: "18 mars 2026",
      level: "urgent",
    },
    {
      title: "Validation du thème",
      date: "21 mars 2026",
      level: "warning",
    },
    {
      title: "Présentation encadreur académique",
      date: "26 mars 2026",
      level: "normal",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF3FA] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-[#D9E2F1] bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1E4AA8]">{greeting}</p>
              <h1 className="mt-1 text-2xl font-bold text-[#0B1C3F] sm:text-3xl">
                Tableau de bord PROJEX
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Suivez vos projets, vos livrables et vos échéances depuis un
                espace centralisé et structuré.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-[#1E4AA8] hover:text-[#1E4AA8]">
                <Bell className="h-4 w-4" />
                Notifications
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#1E4AA8] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1E4AA8]/20 transition hover:bg-[#173B86]">
                Nouvelle action
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Left */}
          <div className="space-y-6">
            {/* Projets récents */}
            <section className="rounded-[28px] border border-[#D9E2F1] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1C3F]">
                    Projets récents
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Vue d’ensemble de vos projets en cours.
                  </p>
                </div>

                <button className="text-sm font-medium text-[#1E4AA8] hover:underline">
                  Voir tout
                </button>
              </div>

              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <ProjectCard key={project.title} {...project} />
                ))}
              </div>
            </section>

            {/* Livrables récents */}
            <section className="rounded-[28px] border border-[#D9E2F1] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1C3F]">
                    Livrables récents
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Derniers fichiers déposés ou examinés.
                  </p>
                </div>

                <button className="text-sm font-medium text-[#1E4AA8] hover:underline">
                  Ouvrir l’espace fichiers
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Fichier</span>
                  <span>Projet</span>
                  <span>Date</span>
                  <span>Statut</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {recentFiles.map((file) => (
                    <div
                      key={file.name}
                      className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] items-center px-4 py-4 text-sm"
                    >
                      <span className="font-medium text-[#0B1C3F]">
                        {file.name}
                      </span>
                      <span className="text-slate-600">{file.project}</span>
                      <span className="text-slate-500">{file.date}</span>
                      <span>
                        <StatusBadge status={file.status} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <section className="rounded-[28px] border border-[#D9E2F1] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-[#0B1C3F]">
                Actions rapides
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Accès direct aux fonctionnalités principales.
              </p>

              <div className="mt-5 grid gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-[#1E4AA8] hover:bg-white hover:text-[#1E4AA8]"
                  >
                    <span>{action}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </section>

            {/* Échéances */}
            <section className="rounded-[28px] border border-[#D9E2F1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#1E4AA8]" />
                <h2 className="text-lg font-semibold text-[#0B1C3F]">
                  Échéances à venir
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                {deadlines.map((item) => (
                  <DeadlineCard key={item.title} {...item} />
                ))}
              </div>
            </section>

            {/* Résumé */}
            <section className="rounded-[28px] bg-[#1E4AA8] p-5 text-white shadow-lg shadow-[#1E4AA8]/20 sm:p-6">
              <h2 className="text-lg font-semibold">Résumé rapide</h2>
              <p className="mt-2 text-sm leading-6 text-white/85">
                Vous avez actuellement 5 échéances proches, 4 livrables en
                attente d’examen et 12 projets actifs.
              </p>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">
                <CheckCircle2 className="h-4 w-4" />
                Continuez vos dépôts pour rester à jour.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, note }) {
  return (
    <div className="rounded-[26px] border border-[#D9E2F1] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-[#0B1C3F]">{value}</h3>
          <p className="mt-2 text-sm text-slate-400">{note}</p>
        </div>

        <div className={`rounded-2xl p-3 text-white ${color}`}>
          {Icon && (
            <Icon className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ title, status, progress, supervisor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-[#0B1C3F]">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Encadreur : {supervisor}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Progression</span>
          <span className="font-medium text-[#1E4AA8]">{progress}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#1E4AA8]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DeadlineCard({ title, date, level }) {
  const styles =
    level === "urgent"
      ? {
          wrap: "border-red-200 bg-red-50",
          icon: "text-red-500",
          text: "text-red-700",
        }
      : level === "warning"
      ? {
          wrap: "border-amber-200 bg-amber-50",
          icon: "text-amber-500",
          text: "text-amber-700",
        }
      : {
          wrap: "border-slate-200 bg-slate-50",
          icon: "text-[#1E4AA8]",
          text: "text-slate-700",
        };

  return (
    <div className={`rounded-2xl border p-4 ${styles.wrap}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`mt-0.5 h-4 w-4 ${styles.icon}`} />
        <div>
          <h3 className={`font-medium ${styles.text}`}>{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{date}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes =
    status === "En cours"
      ? "bg-blue-100 text-blue-700"
      : status === "Validation"
      ? "bg-amber-100 text-amber-700"
      : status === "Démarrage"
      ? "bg-violet-100 text-violet-700"
      : status === "Déposé"
      ? "bg-blue-100 text-blue-700"
      : status === "En revue"
      ? "bg-amber-100 text-amber-700"
      : status === "Validé"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}