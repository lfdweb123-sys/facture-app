// api/v1/invoices/[id].js
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID facture requis' });

  try {
    const docRef = db.collection('invoices').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Facture introuvable' });

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
    }

    // Auth requise pour PATCH et DELETE
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentification requise' });

    const decoded = await admin.auth().verifyIdToken(token);
    const invoiceData = doc.data();

    if (invoiceData.userId !== decoded.uid) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (req.method === 'PATCH') {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Statut requis' });
      
      await docRef.update({
        status,
        ...(status === 'paid' && { paymentDate: new Date().toISOString() }),
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, message: 'Statut mis à jour' });
    }

    if (req.method === 'DELETE') {
      await docRef.delete();
      return res.status(200).json({ success: true, message: 'Facture supprimée' });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('API Invoice:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}