import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Fonction générique pour convertir en CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Échapper les guillemets et virgules
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Fonction pour exporter en Excel
export const exportToExcel = (data: any[], filename: string, sheetName = 'Données') => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Ajuster la largeur des colonnes
  const cols = Object.keys(data[0]).map(() => ({ width: 20 }));
  worksheet['!cols'] = cols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Fonction pour exporter en PDF
export const exportToPDF = (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage
  
  // Titre
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);
  
  // Date d'export
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);

  // Préparer les données pour le tableau
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value || '';
    })
  );

  // Générer le tableau
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 40, right: 10, bottom: 10, left: 10 },
  });

  doc.save(`${filename}.pdf`);
};

// Fonction utilitaire pour télécharger un fichier
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Fonction pour formater les données avant export
export const formatDataForExport = (data: any[], type: string) => {
  return data.map(item => {
    const formatted: any = {};
    
    switch (type) {
      case 'ethnies':
        formatted['Nom'] = item.nom;
        formatted['Synonyme'] = item.synonyme || 'N/A';
        formatted['Description'] = item.description || 'N/A';
        formatted['Tradition'] = item.tradition || 'N/A';
        formatted['Population Estimée'] = item.population_estimee || 'N/A';
        formatted['Pourcentage National'] = item.pourcentage_national ? `${item.pourcentage_national}%` : 'N/A';
        formatted['Statut National'] = item.statut_national || 'N/A';
        break;
        
      case 'langues':
        formatted['Nom'] = item.nom;
        formatted['Description'] = item.description || 'N/A';
        formatted['Nombre Locuteurs'] = item.nombre_locuteurs || 'N/A';
        formatted['Famille Linguistique'] = item.famille_linguistique || 'N/A';
        formatted['Statut'] = item.statut || 'N/A';
        break;
        
      case 'regions':
        formatted['Nom'] = item.nom;
        formatted['Description'] = item.description || 'N/A';
        formatted['Latitude'] = item.latitude || 'N/A';
        formatted['Longitude'] = item.longitude || 'N/A';
        break;
        
      case 'patronymes':
        formatted['Nom'] = item.nom;
        formatted['Signification'] = item.signification || 'N/A';
        formatted['Origine'] = item.origine || 'N/A';
        formatted['Ethnie'] = item.ethnie || 'N/A';
        break;
        
      case 'dialectes':
        formatted['Nom'] = item.nom;
        formatted['Description'] = item.description || 'N/A';
        formatted['Langue Principale'] = item.langue_principale || 'N/A';
        formatted['Localité'] = item.localite || 'N/A';
        break;
        
      default:
        return item;
    }
    
    return formatted;
  });
};
