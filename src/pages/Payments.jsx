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

      // Notifier le freelance
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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"/></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl border p-8 max-w-md text-center"><FileText size={32} className="text-red-400 mx-auto mb-3"/><h2 className="text-lg font-bold text-gray-900 mb-1">Facture introuvable</h2><p className="text-gray-500 text-sm">{error}</p></div></div>;
  if (paid) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl border p-8 max-w-md text-center"><CheckCircle size={40} className="text-emerald-500 mx-auto mb-3"/><h2 className="text-lg font-bold text-gray-900">Facture payée</h2><p className="text-gray-500 text-sm">Cette facture a déjà été réglée.</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
        <div className="bg-gray-900 text-white p-5">
          <div className="flex items-center gap-2 mb-2"><Shield size={18}/><span className="text-sm font-bold">Paiement sécurisé</span></div>
          <p className="text-xs text-gray-400 flex items-center gap-1"><Lock size={11}/>Facture App · FeexPay</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Facture</span><span className="font-semibold">{invoice?.invoiceNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Émetteur</span><span>{invoice?.userName || 'Freelance'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Client</span><span>{invoice?.clientName}</span></div>
            {invoice?.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-xs"><span className="text-gray-500">{item.description} × {item.quantity}</span><span>{(item.quantity*item.unitPrice).toLocaleString()} XOF</span></div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t"><span>Total</span><span>{parseFloat(invoice?.total||0).toLocaleString()} XOF</span></div>
          </div>
          <FeexPayProvider>
            <FeexPayButton 
              amount={parseFloat(invoice?.total)||0} description={`Facture ${invoice?.invoiceNumber}`}
              token={import.meta.env.VITE_FEEXPAY_TOKEN} id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
              customId={`PAY-${invoice?.id}-${Date.now()}`}
              callback_info={{ email: invoice?.clientEmail||'', fullname: invoice?.clientName||'', invoiceId: invoice?.id }}
              mode="LIVE" currency="XOF" callback={handlePaymentSuccess}
              className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all text-center"
            />
          </FeexPayProvider>
          <p className="text-xs text-gray-400 text-center"><Lock size={11}/> Paiement sécurisé</p>
        </div>
      </div>
    </div>
  );
}