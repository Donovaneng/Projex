import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  FileText, 
  Users, 
  ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function SupervisorHelp() {
  const sections = [
    {
      title: "Gestion des Projets",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      content: "Vous pouvez suivre tous vos projets assignés via l'onglet 'Mes Projets'. Chaque projet affiche la progression de l'étudiant basée sur ses tâches terminées. Cliquez sur 'Détails' pour voir l'historique complet et discuter avec l'étudiant."
    },
    {
      title: "Évaluation Académique",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: "Les encadreurs académiques attribuent une note numérique sur 20. Cette note doit refléter la qualité technique, la rigueur méthodologique et la pertinence du travail fourni par l'étudiant."
    },
    {
      title: "Évaluation Professionnelle",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      content: "Les encadreurs professionnels évaluent les compétences via une grille de scores (1 à 5). L'accent est mis sur le savoir-être, l'autonomie en entreprise et l'acquisition de compétences métiers."
    },
    {
      title: "Validation des Livrables",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      content: "Lorsqu'un étudiant dépose un rapport ou un code source, il apparaît dans vos 'Urgences'. Vous devez l'examiner pour le 'Valider' ou le 'Rejeter' avec un motif précis si des corrections sont nécessaires."
    },
    {
      title: "Communication / Chat",
      icon: MessageSquare,
      color: "text-pink-600",
      bg: "bg-pink-50",
      content: "Utilisez le chat intégré dans chaque projet pour échanger en temps réel. Historisez vos conseils et feedbacks pour que l'étudiant puisse s'y référer à tout moment."
    }
  ];

  return (
    <DashboardLayout pageTitle="Guide de l'Encadreur">
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        
        <header className="flex items-center gap-6">
          <Link to="/supervisor/dashboard">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
              <ArrowLeft size={18} className="mr-2" /> Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">
              Centre d'<span className="text-[#1E4AA8]">Aide</span> Superviseur
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Tout ce qu'il faut savoir pour piloter vos projets sur PROJEX.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="md:col-span-2 bg-gradient-to-r from-[#0B1C3F] to-[#1E4AA8] p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <BookOpen size={28} /> Bienvenue dans votre Espace de Suivi
              </h2>
              <p className="text-blue-100 font-medium leading-relaxed">
                PROJEX est conçu pour simplifier l'interaction entre l'école, l'entreprise et l'étudiant. 
                Votre rôle est crucial : vous validez les étapes clés et garantissez la qualité du projet final.
              </p>
            </div>
            <HelpCircle size={150} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </section>

          {sections.map((section) => (
            <Card key={section.title} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
              <Card.Content className="p-8">
                <div className={`w-14 h-14 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6`}>
                  <section.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-[#0B1C3F] mb-3">{section.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {section.content}
                </p>
              </Card.Content>
            </Card>
          ))}
        </div>

        <section className="bg-slate-50 border border-slate-100 p-10 rounded-[2.5rem] text-center space-y-4">
           <h3 className="text-xl font-black text-[#0B1C3F]">Une question technique ?</h3>
           <p className="text-slate-500 font-medium max-w-lg mx-auto">
             Si vous rencontrez un bug ou un problème d'accès, contactez l'administrateur de la plateforme via le module de messagerie globale.
           </p>
           <Link to="/messages">
             <Button className="rounded-xl bg-[#0B1C3F] hover:bg-[#1E4AA8] px-10 py-6 font-bold mt-4 shadow-lg shadow-blue-900/10">
               Contacter le Support
             </Button>
           </Link>
        </section>

      </div>
    </DashboardLayout>
  );
}
