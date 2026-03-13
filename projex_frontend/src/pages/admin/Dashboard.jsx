import StatCard from "../../components/ui/StatCard";
import { Users, FolderKanban, FileText } from "lucide-react";

export default function Dashboard() {

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* stats */}

      <div className="grid grid-cols-3 gap-6">

        <StatCard
          title="Étudiants"
          value="120"
          icon={Users}
        />

        <StatCard
          title="Projets"
          value="45"
          icon={FolderKanban}
        />

        <StatCard
          title="Livrables"
          value="89"
          icon={FileText}
        />

      </div>

    </div>
  );
}