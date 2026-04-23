// api/v1/webhooks.js
const admin = require('firebase-admin');
const crypto = require('crypto');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// Vérifier l'API Key
async function verifyApiKey(apiKey) {
  if (!apiKey) return null;
  const snapshot = await db.collection('users')
    .where('apiKey', '==', apiKey)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vérifier API Key
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const user = await verifyApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'Clé API invalide' });

  // GET : Lister les webhooks
  if (req.method === 'GET') {
    const snapshot = await db.collection('webhooks')
      .where('userId', '==', user.id)
      .get();
    const webhooks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ success: true, data: webhooks });
  }

  // POST : Créer un webhook
  if (req.method === 'POST') {
    const { url, events } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requise' });
    if (!events?.length) return res.status(400).json({ error: 'events requis' });

    const webhookData = {
      userId: user.id,
      url,
      events,
      secret: crypto.randomBytes(16).toString('hex'),
      active: true,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('webhooks').add(webhookData);
    return res.status(201).json({ success: true, data: { id: docRef.id, ...webhookData } });
  }

  // DELETE : Supprimer un webhook
  if (req.method === 'DELETE') {
    const { id } = req.query;
    await db.collection('webhooks').doc(id).delete();
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}