import React, { useState } from 'react';
import { ArrowLeft, LogIn, Phone, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginPageProps {
  onBack: () => void;
  onPageChange: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onPageChange }) => {
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setTelefone(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove formatação do telefone
      const telefoneNumeros = telefone.replace(/\D/g, '');
      
      if (telefoneNumeros.length !== 11) {
        setError('Por favor, digite um número de telefone válido com 11 dígitos');
        setLoading(false);
        return;
      }

      const response = await apiService.loginByTelefone(telefoneNumeros);
      
      // Salvar dados do cliente no localStorage
      localStorage.setItem('clienteLogado', JSON.stringify(response));
      
      // Redirecionar para a página de agendamento do cliente
      onPageChange('client-booking');
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Número de telefone não encontrado. Verifique se você já possui agendamentos em alguma barbearia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Área do Cliente</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto px-4 sm:px-0">
          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Digite seu número de telefone para acessar seus agendamentos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Número de Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    required
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite apenas números. Exemplo: 85999887766
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-3 sm:py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Primeira vez aqui?{' '}
                <span className="text-gray-500">
                  Faça seu primeiro agendamento em uma barbearia parceira
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;