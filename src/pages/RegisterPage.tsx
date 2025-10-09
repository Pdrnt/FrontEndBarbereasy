import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Mail, Lock, User, Phone, MapPin, Check, Star } from 'lucide-react';
import { apiService } from '../services/api';

interface RegisterPageProps {
  onBack: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    barbershopName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const formatPhone = (phone: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 55, mantém; senão adiciona 55
    if (cleaned.startsWith('55')) {
      return cleaned;
    } else {
      return '55' + cleaned;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validações
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      if (!formData.name || !formData.email || !formData.phone || !formData.barbershopName) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Formatar telefone
      const formattedPhone = formatPhone(formData.phone);

      // Criar barbearia (agora sempre com plano CLOSED)
      const barbearia = await apiService.createBarbearia({
        nome: formData.barbershopName,
        nomeProprietario: formData.name,
        email: formData.email,
        senha: formData.password,
        telefone: formattedPhone
      });

      alert(`Barbearia criada com sucesso! Faça login para ativar seu plano.`);
      onBack();
    } catch (error: any) {
      console.error('Erro ao criar barbearia:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulário de Cadastro */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Cadastre sua Barbearia
                </h2>
                <p className="text-gray-600">
                  Gerencie agendamentos e clientes com a BarberEasy
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Barbearia
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="text"
                      name="barbershopName"
                      value={formData.barbershopName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Nome da sua barbearia"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Proprietário
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Confirme sua senha"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </button>
              </form>
            </div>

            {/* Plano Standard */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-yellow-400">
              <div className="text-center mb-6">
                <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Standard</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-lg text-gray-500 line-through">R$ 189,90</span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      OFERTA DE LANÇAMENTO
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    R$ 149,90
                    <span className="text-lg text-gray-500 font-normal">/mês</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Sistema completo de agendamentos</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Gestão de clientes e barbeiros</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Integração com WhatsApp</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Chat inteligente com IA</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dashboard em tempo real</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">URL personalizada para agendamentos</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Controle de horários de funcionamento</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Upload de logo e banner</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Suporte técnico</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 text-center">
                  <strong>Após criar sua conta</strong>, você poderá ativar o plano Standard 
                  e aproveitar todas as funcionalidades da plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

