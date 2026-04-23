// api/push.js - Endpoint pour envoyer des notifications push
const admin = require('firebase-admin');

// Initialiser Firebase Admin (utilise les variables d'environnement Vercel)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { userId, title, body, data } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).json({ error: 'userId, title et body requis' });
  }

  try {
    // Récupérer le token push de l'utilisateur depuis Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const pushToken = userData?.pushToken;

    if (!pushToken) {
      return res.status(404).json({ error: 'Token push non trouvé' });
    }

    // Envoyer la notification
    const message = {
      token: pushToken,
      notification: { title, body },
      data: data || {}
    };

    await admin.messaging().send(message);
    return res.status(200).json({ success: true, message: 'Notification envoyée' });
  } catch (error) {
    console.error('Erreur push:', error);
    return res.status(500).json({ error: error.message });
  }
}