import React, { useEffect } from 'react';

interface PaymentPageProps {
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  // Redirecionar automaticamente para a página de registro
  useEffect(() => {
    onBack();
  }, [onBack]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};

export default PaymentPage;

