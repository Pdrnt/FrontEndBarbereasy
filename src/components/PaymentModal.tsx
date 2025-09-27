import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Copy, QrCode, Check, Star } from 'lucide-react';
import { apiService } from '../services/api';

interface PaymentModalProps {
  onClose: () => void;
  barbeariaId: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  onClose, 
  barbeariaId, 
  onPaymentSuccess 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | null>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePix = async () => {
    setIsGeneratingPix(true);
    setError('');

    try {
      const response = await apiService.gerarPix(barbeariaId);
      setPixData(response.pagamento);
    } catch (error: any) {
      console.error('Erro ao gerar Pix:', error);
      setError(error.message || 'Erro ao gerar Pix. Tente novamente.');
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.pixCopyPaste) {
      navigator.clipboard.writeText(pixData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setPixData(null);
    setError('');
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Ativar Plano Standard</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Informações do Plano */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Plano Standard</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 line-through">R$ 189,90</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    OFERTA
                  </span>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ 149,90
              <span className="text-sm text-gray-500 font-normal">/mês</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!selectedMethod && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Escolha a forma de pagamento:</h3>
              
              {/* Pix */}
              <button
                onClick={() => setSelectedMethod('pix')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Pix</div>
                    <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                  </div>
                </div>
              </button>

              {/* Cartão de Crédito */}
              <button
                disabled
                className="w-full p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed text-left"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Cartão de Crédito</div>
                    <div className="text-sm text-gray-600">Em breve</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {selectedMethod === 'pix' && !pixData && (
            <div className="text-center">
              <div className="mb-4">
                <Smartphone className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamento via Pix</h3>
                <p className="text-gray-600 mb-6">
                  Clique no botão abaixo para gerar o código Pix e finalizar o pagamento.
                </p>
              </div>
              
              <button
                onClick={handleGeneratePix}
                disabled={isGeneratingPix}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPix ? 'Gerando Pix...' : 'Gerar Pix'}
              </button>

              <button
                onClick={() => setSelectedMethod(null)}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Voltar
              </button>
            </div>
          )}

          {pixData && (
            <div className="text-center">
              <div className="mb-4">
                <QrCode className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pix Gerado!</h3>
                <p className="text-gray-600 mb-4">
                  Escaneie o QR Code ou copie o código Pix para finalizar o pagamento.
                </p>
              </div>

              {/* QR Code */}
              {pixData.qrCodeBase64 && (
                <div className="mb-6">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code Pix"
                    className="mx-auto border rounded-lg"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}

              {/* Código Pix para copiar */}
              {pixData.pixCopyPaste && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou copie o código Pix:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={pixData.pixCopyPaste}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="bg-yellow-400 text-black px-3 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-1"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="text-sm">{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Valor:</strong> R$ {pixData.valor.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Após o pagamento, seu plano será ativado automaticamente em alguns minutos.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

