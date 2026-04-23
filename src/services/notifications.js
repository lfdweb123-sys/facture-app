import { sendEmail } from './brevo';
import { getInvoiceEmailTemplate, getContractEmailTemplate, getVerificationStatusEmail } from './brevo';

const APP_URL = import.meta.env.VITE_APP_URL || '';

// ──────────────────────────────────────────────
// PUSH NOTIFICATIONS via le backend Vercel
// ──────────────────────────────────────────────
export async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const response = await fetch(`${APP_URL}/api/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, data })
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur push:', error);
    return { success: false, error: error.message };
  }
}

// ──────────────────────────────────────────────
// EMAIL NOTIFICATIONS (utilise ton brevo.js)
// ──────────────────────────────────────────────

export async function notifyInvoiceCreated(user, invoice, paymentLink) {
  const settings = user?.notificationSettings || {};

  // Email au freelance
  if (settings.emailFactures !== false) {
    await sendEmail({
      to: user.email,
      toName: user.displayName || user.email,
      subject: `Facture ${invoice.invoiceNumber} créée - ${parseFloat(invoice.total || 0).toLocaleString()} XOF`,
      htmlContent: emailFreelanceTemplate('📄 Facture créée', `
        <p style="color:#6b7280;font-size:14px;">Facture <strong>${invoice.invoiceNumber}</strong> de <strong>${parseFloat(invoice.total || 0).toLocaleString()} XOF</strong> créée pour <strong>${invoice.clientName}</strong>.</p>
        ${paymentLink ? `<p style="color:#6b7280;font-size:13px;">Lien : <a href="${paymentLink}" style="color:#111827;">${paymentLink}</a></p>` : ''}
      `)
    });
  }

  // Email au client (si email renseigné)
  if (invoice.clientEmail?.trim()) {
    await sendEmail({
      to: invoice.clientEmail,
      toName: invoice.clientName,
      subject: `Facture ${invoice.invoiceNumber} - ${parseFloat(invoice.total || 0).toLocaleString()} XOF`,
      htmlContent: getInvoiceEmailTemplate(invoice, paymentLink)
    });
  }

  // Push
  if (settings.pushFactures) {
    await sendPushNotification(user.uid, 'Facture créée', `${invoice.invoiceNumber} - ${parseFloat(invoice.total || 0).toLocaleString()} XOF`);
  }
}

export async function notifyPaymentReceived(user, invoice, clientName) {
  const settings = user?.notificationSettings || {};
  const amount = parseFloat(invoice.total || 0).toLocaleString();

  if (settings.emailPaiements !== false) {
    await sendEmail({
      to: user.email,
      toName: user.displayName || user.email,
      subject: `💰 Paiement reçu - ${invoice.invoiceNumber} - ${amount} XOF`,
      htmlContent: emailFreelanceTemplate('💰 Paiement reçu !', `
        <p style="color:#6b7280;font-size:14px;">Paiement de <strong>${amount} XOF</strong> reçu pour la facture <strong>${invoice.invoiceNumber}</strong>.</p>
        <p style="color:#6b7280;font-size:14px;">Client : <strong>${clientName || invoice.clientName}</strong></p>
      `)
    });
  }

  if (settings.pushPaiements) {
    await sendPushNotification(user.uid, '💰 Paiement reçu', `${amount} XOF de ${clientName || invoice.clientName}`);
  }
}

export async function notifyContractCreated(user, contract) {
  const settings = user?.notificationSettings || {};

  if (settings.emailContrats !== false) {
    await sendEmail({
      to: user.email,
      toName: user.displayName || user.email,
      subject: `Contrat créé - ${contract.title || 'Sans titre'}`,
      htmlContent: emailFreelanceTemplate('📋 Contrat créé', `
        <p style="color:#6b7280;font-size:14px;">Contrat <strong>${contract.title}</strong> créé pour <strong>${contract.clientName}</strong>.</p>
        <p style="color:#6b7280;font-size:14px;">Montant : <strong>${parseInt(contract.amount || 0).toLocaleString()} XOF</strong></p>
      `)
    });
  }

  if (contract.clientEmail?.trim()) {
    await sendEmail({
      to: contract.clientEmail,
      toName: contract.clientName,
      subject: `Contrat - ${contract.title || 'Nouveau contrat'}`,
      htmlContent: getContractEmailTemplate(contract)
    });
  }
}

export async function notifyVerificationSubmitted(user) {
  await sendEmail({
    to: user.email,
    toName: user.displayName,
    subject: 'Documents de vérification soumis',
    htmlContent: emailFreelanceTemplate('📋 Documents reçus', `
      <p style="color:#6b7280;font-size:14px;">Vos documents ont bien été reçus. Notre équipe les examinera sous 24 à 48 heures.</p>
    `)
  });
}

export async function notifyVerificationStatus(user, status) {
  const { subject, html } = getVerificationStatusEmail(user.displayName || user.email, status);
  await sendEmail({ to: user.email, toName: user.displayName, subject, htmlContent: html });

  const messages = {
    approved: { title: '✅ Compte vérifié', body: 'Toutes les fonctionnalités sont débloquées.' },
    rejected: { title: '❌ Vérification refusée', body: 'Veuillez soumettre à nouveau.' }
  };
  if (messages[status]) {
    await sendPushNotification(user.uid, messages[status].title, messages[status].body);
  }
}

export async function notifyInvoiceReminder(user, invoice) {
  const settings = user?.notificationSettings || {};
  if (!settings.emailRappels) return;

  await sendEmail({
    to: user.email,
    toName: user.displayName,
    subject: `⏰ Rappel - Facture ${invoice.invoiceNumber}`,
    htmlContent: emailFreelanceTemplate('⏰ Rappel d\'échéance', `
      <p style="color:#6b7280;font-size:14px;">La facture <strong>${invoice.invoiceNumber}</strong> de <strong>${parseFloat(invoice.total || 0).toLocaleString()} XOF</strong> arrive à échéance le <strong>${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</strong>.</p>
      <p style="color:#6b7280;font-size:14px;">Client : <strong>${invoice.clientName}</strong></p>
    `)
  });
}

// Template email simple pour le freelance
function emailFreelanceTemplate(title, content) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:24px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;"></div>
        <h2 style="color:#111827;margin:0 0 12px;font-size:18px;">${title}</h2>
        ${content}
        <p style="color:#9ca3af;font-size:11px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px;">Facture App</p>
      </div>
    </div>
  `;
}