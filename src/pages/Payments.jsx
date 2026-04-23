import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { notifyPaymentReceived } from '../services/notifications';
import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk';
import '@feexpay/react-sdk/style.css';
import { FileText, CheckCircle, Shield, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!invoiceId) { setError('Aucune facture spécifiée'); setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'invoices', invoiceId));
        if (!snap.exists()) { setError('Facture introuvable'); setLoading(false); return; }
        const data = snap.data();
        if (data.status === 'paid') setPaid(true);
        setInvoice({ id: snap.id, ...data });
      } catch { setError('Erreur chargement'); }
      finally { setLoading(false); }
    })();
  }, [invoiceId]);

  const handlePaymentSuccess = async (response) => {
    try {
      await updateDoc(doc(db, 'invoices', invoiceId), {
        status: 'paid', paymentDate: new Date().toISOString(),
        paymentRef: response.transaction_id || '', paymentMethod: response.payment_method || 'feexpay'
      });
      setPaid(true);
      toast.success('Paiement effectué !');

      const invoiceSnap = await getDoc(doc(db, 'invoices', invoiceId));
      const invoiceData = invoiceSnap.data();
      if (invoiceData?.userId) {
        const userSnap = await getDoc(doc(db, 'users', invoiceData.userId));
        if (userSnap.exists()) {
          await notifyPaymentReceived(userSnap.data(), { ...invoiceData, invoiceNumber: invoice?.invoiceNumber }, invoiceData.clientName);
        }
      }
    } catch (err) { console.error('Erreur:', err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
        <FileText size={40} className="text-red-400 mx-auto mb-4"/>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Facture introuvable</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  if (paid) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4"/>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Facture payée ✅</h2>
        <p className="text-gray-500 text-sm">Cette facture a déjà été réglée.</p>
        <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Facture</span><span className="font-medium">{invoice?.invoiceNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold">{parseFloat(invoice?.total||0).toLocaleString()} XOF</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{invoice?.paymentDate ? format(new Date(invoice.paymentDate), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '—'}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={20} />
            <h1 className="text-lg font-bold">Paiement sécurisé</h1>
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
            <Lock size={12} /> Facture App · Paiement crypté par FeexPay
          </p>
        </div>

        {/* Détail facture */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Facture</span>
              <span className="font-semibold text-gray-900">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Émetteur</span>
              <span className="text-gray-900">{invoice?.userName || 'Freelance'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Client</span>
              <span className="text-gray-900">{invoice?.clientName}</span>
            </div>
            
            {invoice?.items?.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{item.description} × {item.quantity}</span>
                    <span>{(item.quantity * item.unitPrice).toLocaleString()} XOF</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">Total à payer</span>
              <span className="text-xl font-bold text-gray-900">{parseFloat(invoice?.total||0).toLocaleString()} XOF</span>
            </div>
          </div>

          {/* Bouton centré */}
          <div className="flex justify-center">
            <FeexPayProvider>
              <FeexPayButton 
                amount={parseFloat(invoice?.total)||0}
                description={`Facture ${invoice?.invoiceNumber}`}
                token={import.meta.env.VITE_FEEXPAY_TOKEN}
                id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
                customId={`PAY-${invoice?.id}-${Date.now()}`}
                callback_info={{
                  email: invoice?.clientEmail||'',
                  fullname: invoice?.clientName||'',
                  invoiceId: invoice?.id
                }}
                mode="LIVE"
                currency="XOF"
                callback={handlePaymentSuccess}
                className="bg-gray-900 text-white font-semibold py-3.5 px-10 rounded-xl hover:bg-gray-800 transition-all text-center inline-flex items-center justify-center gap-2"
              />
            </FeexPayProvider>
          </div>

          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Lock size={11} /> Paiement sécurisé par FeexPay
          </p>
        </div>
      </div>
    </div>
  );
}