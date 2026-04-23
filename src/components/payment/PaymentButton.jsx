import { FeexPayProvider, FeexPayButton } from '@feexpay/react-sdk';
import '@feexpay/react-sdk/style.css';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

export default function PaymentButton({ 
  amount, 
  description, 
  customId,
  callbackInfo,
  onSuccess,
  onError,
  className = '',
  showOptions = true
}) {
  const handleCallback = (response) => {
    if (response.status === 'success') {
      onSuccess?.(response);
    } else {
      onError?.(response);
    }
  };

  return (
    <div className={className}>
      <FeexPayProvider>
        <FeexPayButton 
          amount={amount}
          description={description}
          token={import.meta.env.VITE_FEEXPAY_TOKEN}
          id={import.meta.env.VITE_FEEXPAY_SHOP_ID}
          customId={customId}
          callback_info={callbackInfo}
          mode="LIVE"
          currency="XOF"
          callback={handleCallback}
          buttonText={
            <div className="flex items-center space-x-2">
              <CreditCard size={18} />
              <span>Payer {amount.toLocaleString()} XOF</span>
            </div>
          }
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        />
      </FeexPayProvider>

      {showOptions && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Smartphone size={16} className="mx-auto text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Mobile Money</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <CreditCard size={16} className="mx-auto text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Carte bancaire</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Wallet size={16} className="mx-auto text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Wallet</span>
          </div>
        </div>
      )}
    </div>
  );
}