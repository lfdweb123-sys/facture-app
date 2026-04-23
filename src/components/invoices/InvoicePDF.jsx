import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
  },
  companySubtitle: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  totals: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#f97316',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 40,
  },
  totalValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  gradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#f97316',
  },
  status: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusPaid: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
});

export default function InvoicePDF({ invoice }) {
  if (!invoice) return null;

  const subtotal = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
  const tax = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 0) || 0;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.gradientBar} />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>FREELANCEPRO</Text>
            <Text style={styles.companySubtitle}>Solution de gestion professionnelle</Text>
            <Text style={styles.text}>Cotonou, Bénin</Text>
            <Text style={styles.text}>contact@freelancepro.com</Text>
            <Text style={styles.text}>+229 97 00 00 00</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
            <Text style={styles.text}>Date: {new Date(invoice.date).toLocaleDateString('fr-FR')}</Text>
            <Text style={styles.text}>Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</Text>
            <View style={[
              styles.status,
              invoice.status === 'paid' ? styles.statusPaid : 
              invoice.status === 'pending' ? styles.statusPending : {}
            ]}>
              <Text>
                {invoice.status === 'paid' ? 'PAYÉE' : 
                 invoice.status === 'pending' ? 'EN ATTENTE' : 'EN RETARD'}
              </Text>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à</Text>
          <Text style={[styles.text, { fontWeight: 'bold', color: '#111827' }]}>
            {invoice.clientName}
          </Text>
          <Text style={styles.text}>{invoice.clientEmail}</Text>
          {invoice.clientAddress && (
            <Text style={styles.text}>{invoice.clientAddress}</Text>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qté</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Prix unitaire</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Taxe</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
          </View>
          
          {invoice.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
                {item.unitPrice?.toLocaleString()} XOF
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.tax}%</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
                {(item.quantity * item.unitPrice)?.toLocaleString()} XOF
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{subtotal.toLocaleString()} XOF</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA</Text>
            <Text style={styles.totalValue}>{tax.toLocaleString()} XOF</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.grandTotal}>{total.toLocaleString()} XOF</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={[styles.notes, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Conditions</Text>
            <Text style={styles.text}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FreelancePro - Solution de gestion professionnelle | www.freelancepro.com
          </Text>
          <Text style={styles.footerText}>
            Facture générée automatiquement - Merci pour votre confiance
          </Text>
        </View>
      </Page>
    </Document>
  );
}