// src/services/webhooks.js (ou dans api/)
async function triggerWebhooks(userId, event, data) {
  const snapshot = await db.collection('webhooks')
    .where('userId', '==', userId)
    .where('active', '==', true)
    .where('events', 'array-contains', event)
    .get();

  const webhooks = snapshot.docs.map(d => d.data());

  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Webhook failed:', webhook.url, e.message);
    }
  }
}

// Exemple d'utilisation après un paiement :
// await triggerWebhooks(userId, 'payment.received', { invoiceId, amount, clientName });