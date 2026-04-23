import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk';
import '@feexpay/react-sdk/style.css';
import { 
  FileText, 
  CheckCircle,
  Shield,
  Lock,
  ArrowLeft
} from 'lucide-react';
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
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError('Aucune facture spécifiée');
        setLoading(false);
        return;
      }
      try {
        const invoiceSnap = await getDoc(doc(db, 'invoices', invoiceId));
        if (!invoiceSnap.exists()) {
          setError('Facture introuvable');
          setLoading(false);
          return;
        }
        const invoiceData = invoiceSnap.data();
        if (invoiceData.status === 'paid') {
          setPaid(true);
        }
        setInvoice({ id: invoiceSnap.id, ...invoiceData });
      } catch (err) {
        setError('Erreur lors du chargement de la facture');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handlePaymentSuccess = async (response) => {
    try {
      await updateDoc(doc(db, 'invoices', invoiceId), {
        status: 'paid',
        paymentDate: new Date().toISOString(),
        paymentRef: response.transaction_id || '',
        paymentMethod: response.payment_method || 'feexpay'
      });
      setPaid(true);
      toast.success('Paiement effectué avec succès !');
    } catch (err) {
      console.error('Erreur mise à jour facture:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Facture introuvable</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Facture déjà payée</h2>
          <p className="text-gray-500 mb-4">Cette facture a déjà été réglée.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Facture</span>
              <span className="text-sm font-medium">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Montant</span>
              <span className="text-sm font-bold">{parseFloat(invoice?.total || 0).toLocaleString()} XOF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date de paiement</span>
              <span className="text-sm">{invoice?.paymentDate ? format(new Date(invoice.paymentDate), 'dd/MM/yyyy', { locale: fr }) : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Paiement sécurisé</h1>
              <p className="text-sm text-gray-300">Facture App</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Lock size={14} />
            <span>Paiement crypté et sécurisé par FeexPay</span>
          </div>
        </div>

        {/* Détail facture */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Facture</span>
              <span className="text-sm font-semibold text-gray-900">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Émetteur</span>
              <span className="text-sm text-gray-900">{invoice?.userName || 'Freelance'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Client</span>
              <span className="text-sm text-gray-900">{invoice?.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date</span>
              <span className="text-sm text-gray-900">{invoice?.date ? format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr }) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Échéance</span>
              <span className="text-sm text-gray-900">{invoice?.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr }) : '—'}</span>
            </div>
            {invoice?.items && (
              <div className="pt-3 border-t border-gray-200">
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.description} × {item.quantity}</span>
                    <span className="text-gray-900">{(item.quantity * item.unitPrice).toLocaleString()} XOF</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total à payer</span>
              <span className="text-xl font-bold text-gray-900">{parseFloat(invoice?.total || 0).toLocaleString()} XOF</span>
            </div>
          </div>

          {/* Bouton paiement */}
          <FeexPayProvider>
            <FeexPayButton 
              amount={parseFloat(invoice?.total) || 0}
              description={`Paiement facture ${invoice?.invoiceNumber}`}
              token={import.meta.env.VITE_FEEXPAY_TOKEN}
              id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
              customId={`PAY-${invoice?.id}-${Date.now()}`}
              callback_info={{
                email: invoice?.clientEmail || '',
                fullname: invoice?.clientName || '',
                invoiceId: invoice?.id
              }}
              mode="LIVE"
              currency="XOF"
              callback={handlePaymentSuccess}
              buttonText={`Payer ${parseFloat(invoice?.total || 0).toLocaleString()} XOF`}
              className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-all text-center"
            />
          </FeexPayProvider>

          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Lock size={12} />
            Paiement sécurisé par FeexPay
          </p>
        </div>
      </div>
    </div>
  );
}