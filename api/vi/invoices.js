// api/v1/invoices.js
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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vérifier auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    if (req.method === 'GET') {
      // Lister les factures
      const { status, limit } = req.query;
      let query = db.collection('invoices').where('userId', '==', userId);
      
      if (status) query = query.where('status', '==', status);
      if (limit) query = query.limit(parseInt(limit));
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      const invoices = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ success: true, data: invoices, total: invoices.length });
    }

    if (req.method === 'POST') {
      // Créer une facture
      const { clientName, clientEmail, clientPhone, clientAddress, items, notes, terms, dueDate } = req.body;
      
      if (!clientName) return res.status(400).json({ error: 'clientName requis' });
      if (!items?.length) return res.status(400).json({ error: 'items requis' });

      const invoiceData = {
        userId,
        clientName,
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        clientAddress: clientAddress || '',
        invoiceNumber: `FACT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items,
        notes: notes || '',
        terms: terms || 'Paiement dû à réception',
        subtotal: items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0),
        taxTotal: items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0) * ((i.tax || 0) / 100), 0),
        total: items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0) * (1 + (i.tax || 0) / 100), 0),
        status: 'pending',
        userName: decoded.name || '',
        userEmail: decoded.email || '',
        createdAt: new Date().toISOString()
      };

      const docRef = await db.collection('invoices').add(invoiceData);
      return res.status(201).json({
        success: true,
        data: { id: docRef.id, ...invoiceData },
        paymentLink: `${process.env.VITE_APP_URL || 'https://factureapp.vercel.app'}/pay?invoice=${docRef.id}`
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('API Invoices:', error);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}