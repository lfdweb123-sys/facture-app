const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || 'noreply@factureapp.com';
const SENDER_NAME = 'Facture App';

export async function sendEmail({ to, toName, subject, htmlContent, attachment = null }) {
  if (!BREVO_API_KEY) {
    console.warn('Brevo API key non configurée');
    return { success: false, error: 'API key manquante' };
  }

  if (!to) {
    console.warn('Email destinataire manquant');
    return { success: false, error: 'Destinataire manquant' };
  }

  const emailData = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent
  };

  if (attachment) {
    emailData.attachment = [{
      name: attachment.name,
      content: attachment.content
    }];
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Brevo:', data);
      return { success: false, error: data.message || 'Erreur envoi email' };
    }

    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Erreur Brevo:', error);
    return { success: false, error: error.message };
  }
}

// Templates d'emails
export function getInvoiceEmailTemplate(invoice, paymentLink) {
  const total = parseFloat(invoice.total || 0).toLocaleString();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: #111827; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Facture App</h1>
        <p style="color: #9ca3af; margin: 4px 0 0; font-size: 13px;">Facture professionnelle</p>
      </div>
      
      <div style="background: #fff; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">Bonjour <strong>${invoice.clientName}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Vous avez reçu une facture de la part de <strong>${invoice.userName || 'votre prestataire'}</strong>.
        </p>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280;">Facture N°</td><td style="text-align: right; font-weight: 600; color: #111827;">${invoice.invoiceNumber}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="text-align: right; font-weight: 600; color: #111827;">${new Date(invoice.date).toLocaleDateString('fr-FR')}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Échéance</td><td style="text-align: right; font-weight: 600; color: #111827;">${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td></tr>
            <tr><td colspan="2"><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 8px 0;"/></td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 15px; font-weight: 700;">Total à payer</td><td style="text-align: right; font-size: 15px; font-weight: 700; color: #111827;">${total} XOF</td></tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${paymentLink}" style="display: inline-block; background: #111827; color: #fff; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Payer ma facture
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Paiement sécurisé par FeexPay<br/>
          Facture App - Facture générée électroniquement
        </p>
      </div>
    </div>
  `;
}

export function getContractEmailTemplate(contract) {
  const amount = parseInt(contract.amount || 0).toLocaleString();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: #111827; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Facture App</h1>
        <p style="color: #9ca3af; margin: 4px 0 0; font-size: 13px;">Contrat professionnel</p>
      </div>
      
      <div style="background: #fff; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">Bonjour <strong>${contract.clientName}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Vous avez reçu un contrat de la part de <strong>${contract.userName || 'votre prestataire'}</strong>.
        </p>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280;">Contrat</td><td style="text-align: right; font-weight: 600; color: #111827;">${contract.title || 'Sans titre'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Type</td><td style="text-align: right; font-weight: 600; color: #111827;">${contract.typeLabel || contract.type}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Période</td><td style="text-align: right; font-weight: 600; color: #111827;">${contract.startDate ? new Date(contract.startDate).toLocaleDateString('fr-FR') : '—'} → ${contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : '—'}</td></tr>
            <tr><td colspan="2"><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 8px 0;"/></td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 15px; font-weight: 700;">Montant</td><td style="text-align: right; font-size: 15px; font-weight: 700; color: #111827;">${amount} XOF</td></tr>
          </table>
        </div>
        
        ${contract.description ? `<p style="color: #374151; font-size: 13px; margin: 0 0 16px; line-height: 1.6;"><strong>Description :</strong><br/>${contract.description}</p>` : ''}
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Contrat généré électroniquement<br/>
          Facture App
        </p>
      </div>
    </div>
  `;
}

export function getVerificationStatusEmail(userName, status) {
  const statusMessages = {
    approved: {
      subject: '✅ Votre compte Facture App a été vérifié !',
      color: '#059669',
      emoji: '✅',
      message: 'Félicitations ! Votre compte a été vérifié avec succès. Vous avez maintenant accès à toutes les fonctionnalités de Facture App.'
    },
    rejected: {
      subject: '❌ Vérification de compte refusée',
      color: '#dc2626',
      emoji: '❌',
      message: 'Malheureusement, votre vérification a été refusée. Veuillez soumettre à nouveau vos documents.'
    }
  };

  const config = statusMessages[status] || statusMessages.rejected;

  return {
    subject: config.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 16px;">${config.emoji}</div>
          <h2 style="color: ${config.color}; margin: 0 0 8px; font-size: 18px;">${config.subject.replace(config.emoji+' ','')}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Bonjour <strong>${userName}</strong>,<br/>${config.message}</p>
          <a href="${import.meta.env.VITE_APP_URL || 'https://factureapp.vercel.app'}/dashboard" style="display: inline-block; background: #111827; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
            Accéder à mon compte
          </a>
        </div>
      </div>
    `,
    text: `Bonjour ${userName},\n\n${config.message}\n\nAccédez à votre compte : ${import.meta.env.VITE_APP_URL || 'https://factureapp.vercel.app'}/dashboard`
  };
}