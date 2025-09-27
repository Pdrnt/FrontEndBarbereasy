import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Scissors, Star, MapPin, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiService, formatCurrency, formatDate, formatTime } from '../services/api';

interface ClientBookingPageProps {
  onBack: () => void;
}

interface ClienteLogado {
  cliente: {
    id: number;
    nome: string;
    telefone: string;
    status: string;
  };
  barbearia: {
    id: number;
    nome: string;
    nomeProprietario: string;
    nomeUrl: string;
    logoUrl?: string;
    bannerUrl?: string;
    telefone?: string;
    email: string;
    ativa: boolean;
    plano: string;
    horarios: Array<{
      id: number;
      diaSemana: string;
      horaInicio: string;
      horaFim: string;
    }>;
    servicos: Array<{
      id: number;
      nome: string;
      duracaoMin: number;
      preco: number;
      detalhes?: string;
    }>;
    barbeiros: Array<{
      id: number;
      nome: string;
      especialidade: string;
      ativo: boolean;
    }>;
  };
  agendamentos: {
    ativos: Array<any>;
    historico: Array<any>;
    total: number;
  };
  estatisticas: {
    totalAgendamentos: number;
    agendamentosAtivos: number;
    agendamentosFinalizados: number;
    agendamentosCancelados: number;
  };
}

const ClientBookingPage: React.FC<ClientBookingPageProps> = ({ onBack }) => {
  const [clienteData, setClienteData] = useState<ClienteLogado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClienteData();
  }, []);

  const loadClienteData = () => {
    try {
      const savedData = localStorage.getItem('clienteLogado');
      if (savedData) {
        const data = JSON.parse(savedData);
        setClienteData(data);
      } else {
        setError('Dados do cliente não encontrados. Faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      setError('Erro ao carregar dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AGENDAMENTO_PROGRAMADO':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'ATENDIDO':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELADO':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AGENDAMENTO_PROGRAMADO':
        return 'Agendado';
      case 'ATENDIDO':
        return 'Concluído';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDAMENTO_PROGRAMADO':
        return 'bg-blue-100 text-blue-800';
      case 'ATENDIDO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error || !clienteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const { cliente, barbearia, agendamentos, estatisticas } = clienteData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Sair</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Olá, {cliente.nome}!</h1>
                <p className="text-sm text-gray-600">Seus agendamentos e informações</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium text-gray-900">{cliente.telefone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalAgendamentos}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.agendamentosAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{estatisticas.agendamentosFinalizados}</div>
            <div className="text-sm text-gray-600">Concluídos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600">{estatisticas.agendamentosCancelados}</div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
        </div>

        {/* Informações da Barbearia */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-yellow-500" />
            Sua Barbearia
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{barbearia.nome}</h3>
              <p className="text-gray-600 mb-4">Proprietário: {barbearia.nomeProprietario}</p>
              
              <div className="space-y-2 text-sm">
                {barbearia.telefone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{barbearia.telefone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    barbearia.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {barbearia.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Plano {barbearia.plano}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Horários de Funcionamento</h4>
              <div className="space-y-1 text-sm">
                {barbearia.horarios.map((horario) => (
                  <div key={horario.id} className="flex justify-between">
                    <span className="text-gray-600">{horario.diaSemana}:</span>
                    <span className="font-medium">{horario.horaInicio} - {horario.horaFim}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agendamentos Ativos */}
        {agendamentos.ativos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Próximos Agendamentos
            </h2>
            
            <div className="space-y-4">
              {agendamentos.ativos.map((agendamento) => (
                <div key={agendamento.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(agendamento.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                          {getStatusText(agendamento.status)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{agendamento.nomeServico}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Barbeiro: {agendamento.barbeiro.nome}
                        {agendamento.barbeiro.especialidade && ` - ${agendamento.barbeiro.especialidade}`}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(agendamento.dataHora)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(agendamento.dataHora)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(agendamento.precoServico)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de Agendamentos */}
        {agendamentos.historico.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Histórico de Agendamentos
            </h2>
            
            <div className="space-y-3">
              {agendamentos.historico.slice(0, 5).map((agendamento) => (
                <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(agendamento.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                          {getStatusText(agendamento.status)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{agendamento.nomeServico}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Barbeiro: {agendamento.barbeiro.nome}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(agendamento.dataHora)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(agendamento.dataHora)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(agendamento.precoServico)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {agendamentos.historico.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    E mais {agendamentos.historico.length - 5} agendamentos...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Serviços Disponíveis */}
        {barbearia.servicos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviços Disponíveis</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbearia.servicos.map((servico) => (
                <div key={servico.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{servico.nome}</h3>
                  {servico.detalhes && <p className="text-sm text-gray-500 mb-2">{servico.detalhes}</p>}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{servico.duracaoMin} min</span>
                    <span className="font-semibold text-yellow-600">
                      {formatCurrency(servico.preco)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barbeiros */}
        {barbearia.barbeiros.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nossos Barbeiros</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {barbearia.barbeiros.map((barbeiro) => (
                <div key={barbeiro.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{barbeiro.nome}</h3>
                    <p className="text-sm text-gray-600">{barbeiro.especialidade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem se não há agendamentos */}
        {agendamentos.total === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-gray-600">
              Você ainda não possui agendamentos nesta barbearia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBookingPage;

