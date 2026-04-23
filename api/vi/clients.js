// api/v1/clients.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    if (req.method === 'GET') {
      const clients = new Set();
      const snapshot = await db.collection('invoices')
        .where('userId', '==', userId)
        .get();

      snapshot.docs.forEach(d => {
        const data = d.data();
        if (data.clientEmail) {
          clients.add(JSON.stringify({
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone || '',
            address: data.clientAddress || ''
          }));
        }
      });

      const uniqueClients = Array.from(clients).map(c => JSON.parse(c));
      return res.status(200).json({ success: true, data: uniqueClients });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}