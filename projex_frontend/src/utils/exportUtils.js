import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Génère un fichier Excel à partir de données JSON.
 * @param {Array} data - Tableau d'objets.
 * @param {string} fileName - Nom du fichier.
 */
export const exportToExcel = (data, fileName = 'export_projex.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
  XLSX.writeFile(workbook, fileName);
};

/**
 * Génère un PV de soutenance en PDF.
 * @param {Object} projectData - Détails du projet, jury, notes.
 */
export const generateDefensePDF = (projectData) => {
  const doc = jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 74, 168); // #1E4AA8
  doc.text('PROCES-VERBAL DE SOUTENANCE', 105, 30, { align: 'center' });
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(30, 74, 168);
  doc.line(20, 35, 190, 35);

  // Project Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text('PROJET :', 20, 50);
  doc.setFont("helvetica", "normal");
  doc.text(projectData.project.titre, 50, 50);

  doc.setFont("helvetica", "bold");
  doc.text('ETUDIANT :', 20, 60);
  doc.setFont("helvetica", "normal");
  const student = projectData.team.find(u => u.role === 'ETUDIANT');
  doc.text(`${student?.prenom} ${student?.nom}`, 50, 60);

  // Jury & Logistics
  doc.setFont("helvetica", "bold");
  doc.text('DATE :', 20, 75);
  doc.setFont("helvetica", "normal");
  doc.text(projectData.soutenance?.date_soutenance || 'N/A', 50, 75);

  doc.setFont("helvetica", "bold");
  doc.text('SALLE :', 120, 75);
  doc.setFont("helvetica", "normal");
  doc.text(projectData.soutenance?.salle || 'N/A', 145, 75);

  // Evaluations Table
  doc.autoTable({
    startY: 90,
    head: [['Type Évaluation', 'Note / 20', 'Commentaire']],
    body: [
      ['Académique', projectData.evaluations.academique?.note || '--', projectData.evaluations.academique?.commentaire || '-'],
      ['Professionnelle', projectData.evaluations.professionnelle ? 'Validée' : '--', projectData.evaluations.professionnelle?.commentaire_global || '-'],
      ['Soutenance', projectData.soutenance?.note_finale || '--', projectData.soutenance?.observations || '-']
    ],
    theme: 'striped',
    headStyles: { fillStyle: [30, 74, 168] }
  });

  // Result
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`NOTE FINALE : ${projectData.soutenance?.note_finale || '--'} / 20`, 105, finalY, { align: 'center' });

  // Signatures
  doc.setFontSize(10);
  doc.text('Signature de l\'Administration', 40, finalY + 40);
  doc.text('Signature du Président du Jury', 140, finalY + 40);

  // Save
  doc.save(`PV_Soutenance_${projectData.project.id}.pdf`);
};
