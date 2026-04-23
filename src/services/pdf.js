import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateInvoicePDF(invoiceData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.width;
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text('Facture App', 20, 25);
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('Facture professionnelle', 20, 32);
  
  // Émetteur
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`Émetteur : ${invoiceData.userName || 'Freelance'}`, 20, 44);
  if (invoiceData.userEmail) doc.text(invoiceData.userEmail, 20, 49);
  if (invoiceData.userPhone) doc.text(invoiceData.userPhone, 20, 54);
  if (invoiceData.userCompany) doc.text(invoiceData.userCompany, 20, 59);
  if (invoiceData.userAddress) doc.text(invoiceData.userAddress, 20, 64);
  
  // N° facture et dates
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(`Facture N° ${invoiceData.invoiceNumber}`, 140, 40);
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Date : ${new Date(invoiceData.date).toLocaleDateString('fr-FR')}`, 140, 46);
  doc.text(`Échéance : ${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}`, 140, 52);
  
  // Client
  const clientY = Math.max(72, invoiceData.userAddress ? 72 : 64);
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text('Client :', 20, clientY);
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(invoiceData.clientName || '', 20, clientY + 6);
  if (invoiceData.clientEmail) doc.text(invoiceData.clientEmail, 20, clientY + 11);
  if (invoiceData.clientPhone) doc.text(invoiceData.clientPhone, 20, clientY + 16);
  if (invoiceData.clientAddress) doc.text(invoiceData.clientAddress, 20, clientY + 21);
  
  // Tableau
  const tableStart = clientY + 30;
  const headers = [["Description", "Qté", "Prix unitaire", "Taxe", "Total"]];
  const rows = invoiceData.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString()} XOF`,
    `${item.tax}%`,
    `${(item.quantity * item.unitPrice).toLocaleString()} XOF`
  ]);
  
  doc.autoTable({
    head: headers,
    body: rows,
    startY: tableStart,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Totaux
  const subtotal = invoiceData.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = invoiceData.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.tax/100), 0);
  const total = subtotal + taxTotal;
  
  const colX = 130;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('Sous-total', colX, finalY);
  doc.text(`${subtotal.toLocaleString()} XOF`, 190, finalY, { align: 'right' });
  doc.text('TVA', colX, finalY + 7);
  doc.text(`${taxTotal.toLocaleString()} XOF`, 190, finalY + 7, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', colX, finalY + 18);
  doc.text(`${total.toLocaleString()} XOF`, 190, finalY + 18, { align: 'right' });
  
  // Notes
  if (invoiceData.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Notes :', 20, finalY + 35);
    doc.text(invoiceData.notes, 20, finalY + 41);
  }
  
  // Conditions
  if (invoiceData.terms) {
    doc.setFontSize(8);
    doc.text('Conditions :', 20, finalY + 52);
    doc.text(invoiceData.terms, 20, finalY + 58);
  }
  
  // Signature
  const sigY = Math.max(finalY + 75, 250);
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.text('Facture App - Facture générée électroniquement', pageW/2, sigY, { align: 'center' });
  doc.text(`Signé par : ${invoiceData.userName || 'Freelance'}`, pageW/2, sigY + 6, { align: 'center' });
  doc.text('Signature automatique - Pas de signature manuscrite requise', pageW/2, sigY + 12, { align: 'center' });
  
  return doc;
}

export function downloadInvoicePDF(invoiceData) {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(`facture_${invoiceData.invoiceNumber}.pdf`);
}

export function previewInvoicePDF(invoiceData) {
  const doc = generateInvoicePDF(invoiceData);
  window.open(doc.output('bloburl'), '_blank');
}