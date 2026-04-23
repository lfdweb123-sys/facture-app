// api/v1/generate-key.js
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

function generateApiKey() {
  return 'fa_' + crypto.randomBytes(32).toString('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' });

  // Vérifier auth Firebase
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    // Vérifier si l'utilisateur a déjà une clé
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.apiKey) {
      return res.status(200).json({ success: true, apiKey: userData.apiKey, message: 'Clé existante' });
    }

    // Générer une nouvelle clé
    const apiKey = generateApiKey();
    await db.collection('users').doc(userId).update({
      apiKey,
      apiKeyCreatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({ success: true, apiKey });
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}