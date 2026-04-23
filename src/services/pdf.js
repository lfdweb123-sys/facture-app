import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateInvoicePDF(invoiceData) {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text('FREELANCEPRO', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // Bleu
  doc.text('Facture professionnelle', 20, 30);
  
  // Informations de l'entreprise
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('FreelancePro SARL', 20, 45);
  doc.text('Cotonou, Bénin', 20, 50);
  doc.text('contact@freelancepro.com', 20, 55);
  doc.text('+229 97 00 00 00', 20, 60);
  
  // Numéro de facture et date
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Facture N° ${invoiceData.invoiceNumber}`, 140, 40);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString('fr-FR')}`, 140, 47);
  doc.text(`Échéance: ${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}`, 140, 54);
  
  // Client
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Facturé à:', 20, 80);
  doc.setFontSize(11);
  doc.text(invoiceData.clientName, 20, 87);
  doc.text(invoiceData.clientEmail, 20, 94);
  if (invoiceData.clientAddress) {
    doc.text(invoiceData.clientAddress, 20, 101);
  }
  
  // Tableau des articles
  const tableColumn = ["Description", "Qté", "Prix unitaire", "Taxe", "Total"];
  const tableRows = invoiceData.items.map(item => [
    item.description,
    item.quantity,
    `${item.unitPrice.toLocaleString()} XOF`,
    `${item.tax}%`,
    `${(item.quantity * item.unitPrice).toLocaleString()} XOF`
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 110,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  const finalY = doc.lastAutoTable.finalY + 20;
  
  // Totaux
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0);
  const total = subtotal + tax;
  
  doc.text('Sous-total:', 130, finalY);
  doc.text(`${subtotal.toLocaleString()} XOF`, 170, finalY, { align: 'right' });
  
  doc.text('TVA:', 130, finalY + 7);
  doc.text(`${tax.toLocaleString()} XOF`, 170, finalY + 7, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 130, finalY + 20);
  doc.text(`${total.toLocaleString()} XOF`, 170, finalY + 20, { align: 'right' });
  
  // Notes
  if (invoiceData.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Notes:', 20, finalY + 40);
    doc.text(invoiceData.notes, 20, finalY + 47);
  }
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('FreelancePro - Solution de gestion professionnelle', 105, 285, { align: 'center' });
  doc.text('www.freelancepro.com', 105, 290, { align: 'center' });
  
  return doc;
}

export function downloadInvoicePDF(invoiceData) {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(`facture_${invoiceData.invoiceNumber}.pdf`);
}

export function previewInvoicePDF(invoiceData) {
  const doc = generateInvoicePDF(invoiceData);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}