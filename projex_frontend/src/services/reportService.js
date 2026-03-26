import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const reportService = {
  // Générer la fiche d'un projet
  generateProjectSheet: (project) => {
    const doc = new jsPDF();
    const primaryColor = [30, 74, 168]; // #1E4AA8
    
    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PROJEX - FICHE PROJET', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Système de Gestion des Projets Académiques', 105, 30, { align: 'center' });
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(project.titre || 'Titre non défini', 20, 55);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, 70);
    doc.setFont('helvetica', 'normal');
    const description = doc.splitTextToSize(project.description || 'Aucune description.', 160);
    doc.text(description, 20, 78);
    
    let currentY = 85 + (description.length * 7);
    
    // Informations Générales Table
    doc.autoTable({
      startY: currentY,
      head: [['Champ', 'Valeur']],
      body: [
        ['Statut', project.statut],
        ['Catégorie', project.categorie_label || 'N/A'],
        ['Période', project.period_label || 'Période Active'],
        ['Étudiant', `${project.prenom_etudiant || ''} ${project.nom_etudiant || ''}`],
        ['Date de Début', project.date_debut || 'N/A'],
        ['Date de Fin', project.date_fin || 'N/A']
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Document généré le ${new Date().toLocaleDateString()} par PROJEX`, 105, 285, { align: 'center' });
    
    doc.save(`Projet_${project.id}_${project.titre.substring(0, 20)}.pdf`);
  },

  // Générer le PV de soutenance
  generateDefensePV: (defense) => {
    const doc = new jsPDF();
    const primaryColor = [30, 74, 168];
    
    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PROCÈS-VERBAL DE SOUTENANCE', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Projet : ${defense.projet_titre}`, 105, 38, { align: 'center' });
    
    // Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Informations de la Soutenance', 20, 65);
    doc.line(20, 68, 80, 68);
    
    doc.setFontSize(10);
    doc.text(`Date : ${new Date(defense.date_soutenance).toLocaleDateString()}`, 20, 75);
    doc.text(`Heure : ${new Date(defense.date_soutenance).toLocaleTimeString()}`, 20, 82);
    doc.text(`Lieu : ${defense.salle || 'N/A'}`, 20, 89);
    doc.text(`Étudiant : ${defense.prenom} ${defense.nom}`, 20, 96);
    
    // Jury Table
    doc.setFontSize(14);
    doc.text('Composition du Jury', 20, 110);
    doc.line(20, 113, 80, 113);
    
    let jury = defense.jury;
    if (typeof jury === 'string') {
        try {
            jury = JSON.parse(jury);
        } catch {
            jury = [];
        }
    }
    
    const juryBody = (jury || []).map(m => [
      m.role || 'Membre',
      `${m.prenom || ''} ${m.nom || ''} ${m.external_name || ''}`,
      m.user_role || 'Externe'
    ]);
    
    doc.autoTable({
      startY: 118,
      head: [['Rôle', 'Nom Complet', 'Qualité']],
      body: juryBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });
    
    // Decision Section
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Résultats et Observations', 20, finalY);
    doc.line(20, finalY + 3, 80, finalY + 3);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`NOTE FINALE : ${defense.note_finale || '--'}/20`, 20, finalY + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Observations du jury :', 20, finalY + 25);
    const observations = doc.splitTextToSize(defense.observations || 'Aucune observation particulière.', 160);
    doc.text(observations, 20, finalY + 32);
    
    // Signatures
    let sigY = 240;
    doc.setFontSize(10);
    doc.text('Le Président du Jury', 40, sigY);
    doc.text('Le Rapporteur', 140, sigY);
    
    doc.setDrawColor(0);
    doc.line(20, sigY + 20, 80, sigY + 20); // Placeholder for signature
    doc.line(120, sigY + 20, 180, sigY + 20);
    
    doc.save(`PV_Soutenance_${defense.id}_${defense.nom}.pdf`);
  }
};

export default reportService;
