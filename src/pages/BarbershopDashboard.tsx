import React, { useState, useEffect } from 'react';
import { Calendar, Users, Scissors, DollarSign, Clock, Star, TrendingUp, Settings, ArrowLeft, User, Building, Trash2, Edit, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, LogOut, Plus, CreditCard, AlertCircle, RefreshCw, Filter, Search, Download, Eye, Menu, X, Home } from 'lucide-react';
import { Barbearia, apiService, formatCurrency, formatDate, formatTime } from '../services/api';
import { useBarbeariaData } from '../hooks/useBarbeariaData';
import HorariosFuncionamento from '../components/HorariosFuncionamento';
import ImageUpload from '../components/ImageUpload';
import PaymentModal from '../components/PaymentModal';
import { ThemeToggle } from '../components/ThemeToggle';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface BarbershopDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  barbearia: Barbearia | null;
}

const BarbershopDashboard: React.FC<BarbershopDashboardProps> = ({ onBack, onLogout, barbearia: initialBarbearia }) => {
  // =================================================================================
  // CORREÇÃO: Estado para gerenciar dados atualizados da barbearia
  // =================================================================================
  const [dadosBarbearia, setDadosBarbearia] = useState<Barbearia | null>(initialBarbearia);
  const [isLoadingPlano, setIsLoadingPlano] = useState(true);

  const [activeTab, setActiveTab] = useState('visao-geral');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddProfessional, setShowAddProfessional] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [newProfessional, setNewProfessional] = useState({ nome: '', especialidade: '' });
  const [newService, setNewService] = useState({ nome: '', duracaoMin: '', preco: '', detalhes: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Novos estados para filtros e funcionalidades
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AGENDAMENTO_PROGRAMADO' | 'ATENDIDO' | 'CANCELADO'>('all');
  const [barbeiroFilter, setBarbeiroFilter] = useState<'all' | number>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para seção financeira
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

  // Estado para controle de erro da logo
  const [logoError, setLogoError] = useState(false);

  // Estados para gerenciar intervalos
  const [intervalos, setIntervalos] = useState<any[]>([]);
  const [showAddIntervalo, setShowAddIntervalo] = useState(false);
  const [editingIntervalo, setEditingIntervalo] = useState<any>(null);
  const [newIntervalo, setNewIntervalo] = useState({
    barbeiroId: '',
    diaSemana: '',
    horaInicio: '',
    horaFim: '',
    data: ''
  });

  // Estados para edição de dados da barbearia
  const [isEditingBarbearia, setIsEditingBarbearia] = useState(false);
  const [editedBarbearia, setEditedBarbearia] = useState({
    nome: '',
    nomeProprietario: '',
    email: '',
    telefone: '',
    estado: '',
    cidade: '',
    cep: '',
    bairro: '',
    complemento: '',
    pontoReferencia: ''
  });

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // =================================================================================
  // CORREÇÃO: useEffect para verificar plano sempre que o componente for montado
  // =================================================================================
  useEffect(() => {
    const verificarPlanoAtualizado = async () => {
      if (!initialBarbearia?.id) {
        setIsLoadingPlano(false);
        return;
      }

      try {
        setIsLoadingPlano(true);
        // Busca os dados mais recentes da barbearia no servidor
        const barbeariaAtualizada = await apiService.getBarbeariaById(initialBarbearia.id);
        setDadosBarbearia(barbeariaAtualizada);

        // Inicializa os dados editáveis
        setEditedBarbearia({
          nome: barbeariaAtualizada.nome || '',
          nomeProprietario: barbeariaAtualizada.nomeProprietario || '',
          email: barbeariaAtualizada.email || '',
          telefone: barbeariaAtualizada.telefone || '',
          estado: barbeariaAtualizada.estado || '',
          cidade: barbeariaAtualizada.cidade || '',
          cep: barbeariaAtualizada.cep || '',
          bairro: barbeariaAtualizada.bairro || '',
          complemento: barbeariaAtualizada.complemento || '',
          pontoReferencia: barbeariaAtualizada.pontoReferencia || ''
        });

        // Atualiza também o localStorage com os dados mais recentes
        localStorage.setItem('barbeariaLogada', JSON.stringify(barbeariaAtualizada));
      } catch (error) {
        console.error('Erro ao verificar plano da barbearia:', error);
        // Em caso de erro, mantém os dados iniciais
        setDadosBarbearia(initialBarbearia);
      } finally {
        setIsLoadingPlano(false);
      }
    };

    verificarPlanoAtualizado();
  }, [initialBarbearia?.id]); // Executa sempre que o ID da barbearia mudar

  // Hook para gerenciar dados da barbearia (usando os dados atualizados)
  const {
    barbeiros,
    servicos,
    agendamentos,
    isLoading,
    error,
    addBarbeiro,
    updateBarbeiro,
    removeBarbeiro,
    addServico,
    updateServico,
    removeServico,
    updateAgendamento,
    refreshData
  } = useBarbeariaData(dadosBarbearia?.id || null);

  // Funções para formatar data e hora com ajuste de fuso horário (corrige bug de -3h)
  const formatTimeWithOffset = (dateString: string, offset = 3) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + offset);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateWithOffset = (dateString: string, offset = 3) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + offset);
    return date.toLocaleDateString('pt-BR');
  };

  // Mantém função antiga para outros usos
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para validar se a URL da logo é válida
  const isValidLogoUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Função para resetar erro da logo quando a URL mudar
  useEffect(() => {
    setLogoError(false);
  }, [dadosBarbearia?.logoUrl]);

  // Função para atualizar dados com indicador visual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Função para carregar pagamentos
  const loadPagamentos = async () => {
    if (!dadosBarbearia?.id) return;

    setLoadingPagamentos(true);
    try {
      const pagamentosData = await apiService.getPagamentosByBarbearia(dadosBarbearia.id);
      setPagamentos(pagamentosData);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  // Função para salvar dados da barbearia
  const handleSaveBarbearia = async () => {
    if (!dadosBarbearia?.id) return;

    try {
      const updatedBarbearia = await apiService.updateBarbearia(dadosBarbearia.id, editedBarbearia);
      setDadosBarbearia(updatedBarbearia);
      setIsEditingBarbearia(false);
      localStorage.setItem('barbeariaLogada', JSON.stringify(updatedBarbearia));
    } catch (error) {
      console.error('Erro ao atualizar dados da barbearia:', error);
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    if (dadosBarbearia) {
      setEditedBarbearia({
        nome: dadosBarbearia.nome || '',
        nomeProprietario: dadosBarbearia.nomeProprietario || '',
        email: dadosBarbearia.email || '',
        telefone: dadosBarbearia.telefone || '',
        estado: dadosBarbearia.estado || '',
        cidade: dadosBarbearia.cidade || '',
        cep: dadosBarbearia.cep || '',
        bairro: dadosBarbearia.bairro || '',
        complemento: dadosBarbearia.complemento || '',
        pontoReferencia: dadosBarbearia.pontoReferencia || ''
      });
    }
    setIsEditingBarbearia(false);
  };

  // Função para calcular dias restantes do plano
  const calcularDiasRestantes = (updatedAt: string): number => {
    const dataAtualizacao = new Date(updatedAt);
    const dataVencimento = new Date(dataAtualizacao);
    dataVencimento.setDate(dataVencimento.getDate() + 31);

    const hoje = new Date();
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  // Carregar pagamentos quando a aba financeiro for selecionada
  useEffect(() => {
    if (activeTab === 'financeiro') {
      loadPagamentos();
    }
  }, [activeTab, dadosBarbearia?.id]);

  // Função para carregar intervalos
  const loadIntervalos = async () => {
    if (!dadosBarbearia?.id) return;

    try {
      const intervalosData = await apiService.getIntervalosByBarbearia(dadosBarbearia.id);
      setIntervalos(intervalosData);
    } catch (error) {
      console.error('Erro ao carregar intervalos:', error);
    }
  };

  // Carregar intervalos quando necessário
  useEffect(() => {
    if (dadosBarbearia?.id) {
      loadIntervalos();
    }
  }, [dadosBarbearia?.id]);

  // Função para adicionar/editar intervalo
  const handleAddIntervalo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dadosBarbearia?.id) return;

    try {
      const intervaloData = {
        barbeariaId: dadosBarbearia.id,
        barbeiroId: newIntervalo.barbeiroId ? parseInt(newIntervalo.barbeiroId) : null,
        diaSemana: newIntervalo.diaSemana,
        horaInicio: newIntervalo.horaInicio,
        horaFim: newIntervalo.horaFim,
        data: newIntervalo.data || null
      };

      if (editingIntervalo) {
        // Editar intervalo existente
        const response = await fetch(`${API_BASE_URL}/intervalos/${editingIntervalo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(intervaloData)
        });
        if (response.ok) {
          await loadIntervalos();
          setEditingIntervalo(null);
        }
      } else {
        // Criar novo intervalo usando apiService
        await apiService.createIntervalo(intervaloData);
        await loadIntervalos();
      }

      setNewIntervalo({
        barbeiroId: '',
        diaSemana: '',
        horaInicio: '',
        horaFim: '',
        data: ''
      });
      setShowAddIntervalo(false);
    } catch (error) {
      console.error('Erro ao salvar intervalo:', error);
      alert('Erro ao salvar intervalo');
    }
  };

  // Função para editar intervalo
  const handleEditIntervalo = (intervalo: any) => {
    setEditingIntervalo(intervalo);
    setNewIntervalo({
      barbeiroId: intervalo.barbeiroId?.toString() || '',
      diaSemana: intervalo.diaSemana,
      horaInicio: intervalo.horaInicio,
      horaFim: intervalo.horaFim,
      data: intervalo.data ? new Date(intervalo.data).toISOString().split('T')[0] : ''
    });
    setShowAddIntervalo(true);
  };

  // Função para remover intervalo
  const handleRemoveIntervalo = async (intervaloId: number) => {
    if (window.confirm('Tem certeza que deseja remover este intervalo?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/intervalos/${intervaloId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await loadIntervalos();
        }
      } catch (error) {
        console.error('Erro ao remover intervalo:', error);
        alert('Erro ao remover intervalo');
      }
    }
  };

  // Função para filtrar agendamentos
  const getFilteredAgendamentos = () => {
    let filtered = [...agendamentos];

    // Filtro por data
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora).toDateString();
          return agendamentoDate === today.toDateString();
        });
        break;
      case 'week':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora);
          return agendamentoDate >= startOfWeek && agendamentoDate <= endOfWeek;
        });
        break;
      case 'month':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora);
          return agendamentoDate >= startOfMonth && agendamentoDate <= endOfMonth;
        });
        break;
      case 'custom':
        if (customDateStart && customDateEnd) {
          const startDate = new Date(customDateStart);
          const endDate = new Date(customDateEnd);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(a => {
            const agendamentoDate = new Date(a.dataHora);
            return agendamentoDate >= startDate && agendamentoDate <= endDate;
          });
        }
        break;
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    // Filtro por barbeiro
    if (barbeiroFilter !== 'all') {
      filtered = filtered.filter(a => a.barbeiroId === barbeiroFilter);
    }

    // Filtro por busca (nome do cliente)
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nomeServico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
  };

  const filteredAgendamentos = getFilteredAgendamentos();

  // Estatísticas calculadas a partir dos dados filtrados
  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: agendamentos.filter(a => {
        const today = new Date().toDateString();
        const agendamentoDate = new Date(a.dataHora).toDateString();
        return agendamentoDate === today;
      }).length.toString(),
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      label: 'Total de Barbeiros',
      value: barbeiros.filter(b => b.ativo).length.toString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Serviços Ativos',
      value: servicos.length.toString(),
      icon: Scissors,
      color: 'bg-purple-500'
    },
    {
      label: 'Faturamento Hoje',
      value: formatCurrency(
        agendamentos
          .filter(a => {
            const today = new Date().toDateString();
            const agendamentoDate = new Date(a.dataHora).toDateString();
            return agendamentoDate === today && a.status === 'ATENDIDO';
          })
          .reduce((total, a) => total + a.precoServico, 0)
      ),
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return 'bg-green-100 text-green-800';
      case 'AGENDAMENTO_PROGRAMADO': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return 'Concluído';
      case 'AGENDAMENTO_PROGRAMADO': return 'Pendente';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'AGENDAMENTO_PROGRAMADO': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CANCELADO': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessional.nome && newProfessional.especialidade) {
      try {
        if (editingProfessional) {
          await updateBarbeiro(editingProfessional.id, {
            nome: newProfessional.nome,
            especialidade: newProfessional.especialidade
          });
          setEditingProfessional(null);
        } else {
          await addBarbeiro(newProfessional);
        }
        setNewProfessional({ nome: '', especialidade: '' });
        setShowAddProfessional(false);
      } catch (error: any) {
        alert('Erro ao salvar barbeiro: ' + error.message);
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.nome && newService.duracaoMin && newService.preco) {
      try {
        const duracaoMin = parseInt(newService.duracaoMin);
        const preco = parseFloat(newService.preco);

        if (editingService) {
          await updateServico(editingService.id, {
            nome: newService.nome,
            duracaoMin,
            preco,
            detalhes: newService.detalhes
          });
          setEditingService(null);
        } else {
          await addServico({
            nome: newService.nome,
            duracaoMin,
            preco,
            detalhes: newService.detalhes
          });
        }
        setNewService({ nome: '', duracaoMin: '', preco: '', detalhes: '' });
        setShowAddService(false);
      } catch (error: any) {
        alert('Erro ao salvar serviço: ' + error.message);
      }
    }
  };

  const handleEditProfessional = (professional: any) => {
    setEditingProfessional(professional);
    setNewProfessional({
      nome: professional.nome,
      especialidade: professional.especialidade
    });
    setShowAddProfessional(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setNewService({
      nome: service.nome,
      duracaoMin: service.duracaoMin.toString(),
      preco: service.preco.toString(),
      detalhes: service.detalhes || ''
    });
    setShowAddService(true);
  };

  const handleRemoveProfessional = async (professionalId: number) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      try {
        await removeBarbeiro(professionalId);
      } catch (error: any) {
        alert('Erro ao remover barbeiro: ' + error.message);
      }
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      try {
        await removeServico(serviceId);
      } catch (error: any) {
        alert('Erro ao remover serviço: ' + error.message);
      }
    }
  };

  const handleUpdateAgendamentoStatus = async (agendamentoId: number, newStatus: string) => {
    try {
      await updateAgendamento(agendamentoId, { status: newStatus });
    } catch (error: any) {
      alert('Erro ao atualizar agendamento: ' + error.message);
    }
  };

  // Exportar dados para CSV (corrigido para usar horário ajustado)
  const exportToCSV = () => {
    const headers = ['Data', 'Horário', 'Cliente', 'Telefone', 'Serviço', 'Barbeiro', 'Valor', 'Status'];
    const csvData = filteredAgendamentos.map(a => [
      formatDateWithOffset(a.dataHora, 3),
      formatTimeWithOffset(a.dataHora, 3),
      a.cliente?.nome || 'N/A',
      a.cliente?.telefone || 'N/A',
      a.nomeServico,
      barbeiros.find(b => b.id === a.barbeiroId)?.nome || 'N/A',
      formatCurrency(a.precoServico),
      getStatusText(a.status)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar agendamentos por data selecionada (para visão geral)
  const agendamentosDodia = agendamentos.filter(agendamento => {
    // Ajusta o horário para +3h antes de comparar
    const agendamentoDate = new Date(agendamento.dataHora);
    agendamentoDate.setHours(agendamentoDate.getHours() + 3);
    return agendamentoDate.toDateString() === selectedDate.toDateString();
  });

  // Definir itens de navegação
  const navigationItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Home },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'profissionais', label: 'Profissionais', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Scissors },
    { id: 'intervalos', label: 'Intervalos', icon: Clock },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  // =================================================================================
  // CORREÇÃO: Verificação de loading e dados da barbearia
  // =================================================================================
  if (isLoadingPlano) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando status do plano...</p>
        </div>
      </div>
    );
  }

  if (!dadosBarbearia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro: Dados da barbearia não encontrados</p>
          <button
            onClick={onBack}
            className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // VERIFICAÇÃO DE PLANO
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar/Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e título da barbearia */}
            <div className="flex items-center space-x-3">
              {isValidLogoUrl(dadosBarbearia.logoUrl) && !logoError ? (
                <img
                  src={dadosBarbearia.logoUrl}
                  alt={`Logo ${dadosBarbearia.nome}`}
                  className="w-8 h-8 object-cover rounded-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-black" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {dadosBarbearia.nome}
                </h1>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dadosBarbearia.plano === 'STANDARD' ? 'bg-green-100 text-green-800' :
                    dadosBarbearia.plano === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {dadosBarbearia.plano === 'STANDARD' ? 'Standard' :
                      dadosBarbearia.plano === 'PREMIUM' ? 'Premium' :
                        'Básico'}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme toggle and user actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="flex items-center justify-center px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center space-x-3">
              {isValidLogoUrl(dadosBarbearia.logoUrl) && !logoError ? (
                <img
                  src={dadosBarbearia.logoUrl}
                  alt={`Logo ${dadosBarbearia.nome}`}
                  className="w-8 h-8 object-cover rounded-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-black" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {dadosBarbearia.nome}
                </h1>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dadosBarbearia.plano === 'STANDARD' ? 'bg-green-100 text-green-800' :
                    dadosBarbearia.plano === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {dadosBarbearia.plano === 'STANDARD' ? 'Standard' :
                      dadosBarbearia.plano === 'PREMIUM' ? 'Premium' :
                        'Básico'}
                  </span>
                </div>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`${activeTab === item.id
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 w-full transition-colors`}
                  >
                    <Icon className={`${activeTab === item.id ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
            <div className="space-y-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-3"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                  )}
                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">Voltar</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {dadosBarbearia.plano !== 'CLOSED' && dadosBarbearia.updatedAt && (
                    <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {calcularDiasRestantes(dadosBarbearia.updatedAt)} dias restantes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">Erro ao carregar dados: {error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 text-red-700 hover:text-red-900 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Tab Content */}
              {!isLoading && !error && (
                <>
                  {/* Visão Geral */}
                  {activeTab === 'visao-geral' && (
                    <div className="space-y-6">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => {
                          const Icon = stat.icon;
                          return (
                            <div key={index} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-2 sm:p-3 rounded-full ${stat.color} flex-shrink-0`}>
                                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Calendar and Appointments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Calendar */}
                        <div className="lg:col-span-1">
                          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendário</h3>
                            <div className="space-y-4">
                              {/* Calendar Header */}
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(currentMonth.getMonth() - 1);
                                    setCurrentMonth(newMonth);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <h4 className="font-medium text-sm sm:text-base">
                                  {currentMonth.toLocaleDateString('pt-BR', {
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </h4>
                                <button
                                  onClick={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(currentMonth.getMonth() + 1);
                                    setCurrentMonth(newMonth);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Calendar Grid */}
                              <div className="overflow-x-auto">
                                <div className="grid grid-cols-7 gap-1 text-center">
                                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="p-1 sm:p-2 text-xs font-medium text-gray-500">
                                      {day}
                                    </div>
                                  ))}
                                  {(() => {
                                    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                    const days = [];

                                    // Empty cells for days before month starts
                                    for (let i = 0; i < firstDay.getDay(); i++) {
                                      days.push(<div key={`empty-${i}`} className="p-1 sm:p-2"></div>);
                                    }

                                    // Days of the month
                                    for (let day = 1; day <= lastDay.getDate(); day++) {
                                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                      const isSelected = selectedDate.toDateString() === date.toDateString();
                                      const isToday = new Date().toDateString() === date.toDateString();
                                      const hasAppointments = agendamentos.some(a =>
                                        new Date(a.dataHora).toDateString() === date.toDateString()
                                      );

                                      days.push(
                                        <button
                                          key={day}
                                          onClick={() => setSelectedDate(date)}
                                          className={`p-1 sm:p-2 text-xs sm:text-sm rounded-lg transition-colors relative ${isSelected
                                            ? 'bg-yellow-400 text-black'
                                            : isToday
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'hover:bg-gray-100'
                                            }`}
                                        >
                                          {day}
                                          {hasAppointments && (
                                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                          )}
                                        </button>
                                      );
                                    }

                                    return days;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Appointments for Selected Date */}
                        <div className="lg:col-span-2 w-full">
                          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 overflow-x-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Agendamentos - {selectedDate.toLocaleDateString('pt-BR')}
                              </h3>
                              <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              >
                                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="sm:hidden text-sm">Atualizar</span>
                              </button>
                            </div>
                            {agendamentosDodia.length === 0 ? (
                              <p className="text-gray-500">Nenhum agendamento para esta data.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                      </th>
                                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Serviço
                                      </th>
                                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Barbeiro
                                      </th>
                                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Horário
                                      </th>
                                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {agendamentosDodia.map((agendamento) => (
                                      <tr key={agendamento.id} className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                                              </div>
                                            </div>
                                            <div className="flex flex-col text-sm">
                                              <div className="text-sm font-medium text-gray-900">
                                                {agendamento.cliente?.nome || 'Cliente não informado'}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {agendamento.cliente?.telefone || 'Telefone não informado'}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <div>{agendamento.nomeServico}</div>
                                          <div className="text-gray-500 sm:hidden ">
                                            {formatCurrency(agendamento.precoServico)}
                                          </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {barbeiros.find(b => b.id === agendamento.barbeiroId)?.nome || 'N/A'}
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <div>{formatTimeWithOffset(agendamento.dataHora, 3)}</div>
                                          <div className="text-gray-500 sm:hidden ">
                                            {formatDateWithOffset(agendamento.dataHora, 3)}
                                          </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-2">
                                            {getStatusIcon(agendamento.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                              {getStatusText(agendamento.status)}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agendamentos */}
                  {activeTab === 'agendamentos' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Todos os Agendamentos</h2>

                      {/* Filters and Search */}
                      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                          <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Filter className="h-5 w-5" />
                          </button>
                        </div>

                        {showFilters && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700">Período</label>
                              <select
                                id="dateFilter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'month' | 'custom')}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                              >
                                <option value="today">Hoje</option>
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mês</option>
                                <option value="custom">Personalizado</option>
                              </select>
                            </div>
                            {dateFilter === 'custom' && (
                              <div className="flex space-x-2">
                                <div>
                                  <label htmlFor="customDateStart" className="block text-sm font-medium text-gray-700">De</label>
                                  <input
                                    type="date"
                                    id="customDateStart"
                                    value={customDateStart}
                                    onChange={(e) => setCustomDateStart(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="customDateEnd" className="block text-sm font-medium text-gray-700">Até</label>
                                  <input
                                    type="date"
                                    id="customDateEnd"
                                    value={customDateEnd}
                                    onChange={(e) => setCustomDateEnd(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                                  />
                                </div>
                              </div>
                            )}
                            <div>
                              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
                              <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'AGENDAMENTO_PROGRAMADO' | 'ATENDIDO' | 'CANCELADO')}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                              >
                                <option value="all">Todos</option>
                                <option value="AGENDAMENTO_PROGRAMADO">Pendente</option>
                                <option value="ATENDIDO">Concluído</option>
                                <option value="CANCELADO">Cancelado</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="barbeiroFilter" className="block text-sm font-medium text-gray-700">Barbeiro</label>
                              <select
                                id="barbeiroFilter"
                                value={barbeiroFilter}
                                onChange={(e) => setBarbeiroFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                              >
                                <option value="all">Todos</option>
                                {barbeiros.map(barbeiro => (
                                  <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Buscar Cliente/Serviço</label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                  type="text"
                                  id="searchTerm"
                                  className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Nome do cliente ou serviço..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Exportar CSV</span>
                          </button>
                          <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Atualizar</span>
                          </button>
                        </div>
                      </div>

                      {/* Appointments Table */}
                      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cliente
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Serviço
                                </th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Barbeiro
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Data e Hora
                                </th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Valor
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredAgendamentos.map((agendamento) => (
                                <tr key={agendamento.id} className="hover:bg-gray-50">
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                                        </div>
                                      </div>
                                      <div className="ml-2 sm:ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {agendamento.cliente?.nome || 'Cliente não informado'}
                                        </div>
                                        <div className="text-sm text-gray-500 sm:hidden">
                                          {agendamento.cliente?.telefone || 'Telefone não informado'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                      <div>{agendamento.nomeServico}</div>
                                      <div className="text-gray-500 sm:hidden ">
                                        {formatCurrency(agendamento.precoServico)}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {barbeiros.find(b => b.id === agendamento.barbeiroId)?.nome || 'N/A'}
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                      <div>{formatDateWithOffset(agendamento.dataHora, 3)}</div>
                                      <div className="text-gray-500">{formatTimeWithOffset(agendamento.dataHora, 3)}</div>
                                    </div>
                                  </td>
                                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(agendamento.precoServico)}
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(agendamento.status)}
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                        {getStatusText(agendamento.status)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                      {agendamento.status === 'AGENDAMENTO_PROGRAMADO' && (
                                        <button
                                          onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'ATENDIDO')}
                                          className="text-green-600 hover:text-green-900"
                                          title="Marcar como concluído"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      {agendamento.status !== 'CANCELADO' && (
                                        <button
                                          onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'CANCELADO')}
                                          className="text-red-600 hover:text-red-900"
                                          title="Cancelar agendamento"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      <button
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Ver detalhes"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profissionais */}
                  {activeTab === 'profissionais' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Profissionais</h2>
                        <button
                          onClick={() => setShowAddProfessional(true)}
                          className="flex items-center justify-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar Profissional</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {barbeiros.filter(b => b.ativo).map((barbeiro) => (
                          <div key={barbeiro.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 truncate">{barbeiro.nome}</h3>
                                  <p className="text-sm text-gray-600 truncate">{barbeiro.especialidade}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditProfessional(barbeiro)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveProfessional(barbeiro.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remover"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Agendamentos hoje:</span>
                                <span className="font-medium">
                                  {agendamentos.filter(a => {
                                    const today = new Date().toDateString();
                                    const agendamentoDate = new Date(a.dataHora).toDateString();
                                    return agendamentoDate === today && a.barbeiroId === barbeiro.id;
                                  }).length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className="text-green-600 font-medium">Ativo</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Professional Modal */}
                      {showAddProfessional && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}
                            </h3>
                            <form onSubmit={handleAddProfessional} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nome
                                </label>
                                <input
                                  type="text"
                                  value={newProfessional.nome}
                                  onChange={(e) => setNewProfessional({ ...newProfessional, nome: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Especialidade
                                </label>
                                <input
                                  type="text"
                                  value={newProfessional.especialidade}
                                  onChange={(e) => setNewProfessional({ ...newProfessional, especialidade: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                  type="submit"
                                  className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                  {editingProfessional ? 'Salvar' : 'Adicionar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddProfessional(false);
                                    setEditingProfessional(null);
                                    setNewProfessional({ nome: '', especialidade: '' });
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Serviços */}
                  {activeTab === 'servicos' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
                        <button
                          onClick={() => setShowAddService(true)}
                          className="flex items-center justify-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar Serviço</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {servicos.map((servico) => (
                          <div key={servico.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 truncate">{servico.nome}</h3>
                                  <p className="text-sm text-gray-600">{servico.duracaoMin} min</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditService(servico)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveService(servico.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remover"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Preço:</span>
                                <span className="font-medium">{formatCurrency(servico.preco)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Duração:</span>
                                <span className="font-medium">{servico.duracaoMin} min</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Service Modal */}
                      {showAddService && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
                            </h3>
                            <form onSubmit={handleAddService} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nome do Serviço
                                </label>
                                <input
                                  type="text"
                                  value={newService.nome}
                                  onChange={(e) => setNewService({ ...newService, nome: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Duração (minutos)
                                </label>
                                <input
                                  type="number"
                                  value={newService.duracaoMin}
                                  onChange={(e) => setNewService({ ...newService, duracaoMin: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Preço (R$)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={newService.preco}
                                  onChange={(e) => setNewService({ ...newService, preco: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Detalhes do Serviço
                                </label>
                                <textarea
                                  value={newService.detalhes}
                                  onChange={(e) => setNewService({ ...newService, detalhes: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  rows={3}
                                  placeholder="Adicione detalhes sobre o serviço..."
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                  type="submit"
                                  className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                  {editingService ? 'Salvar' : 'Adicionar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddService(false);
                                    setEditingService(null);
                                    setNewService({ nome: '', duracaoMin: '', preco: '', detalhes: '' });
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Intervalos */}
                  {activeTab === 'intervalos' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Horários de Intervalo</h2>
                        <button
                          onClick={() => setShowAddIntervalod(true)}
                          className="flex items-center justify-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Em Manutenção</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervalos Cadastrados</h3>
                        {intervalos.length === 0 ? (
                          <p className="text-gray-500">Nenhum intervalo cadastrado.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Barbeiro
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dia da Semana
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Horário
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data Específica
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {intervalos.map((intervalo) => (
                                  <tr key={intervalo.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {intervalo.barbeiro ? intervalo.barbeiro.nome : 'Todos os barbeiros'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {intervalo.diaSemana}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {intervalo.horaInicio} - {intervalo.horaFim}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {intervalo.data ? new Date(intervalo.data).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleEditIntervalo(intervalo)}
                                          className="text-blue-600 hover:text-blue-900"
                                          title="Editar"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleRemoveIntervalo(intervalo.id)}
                                          className="text-red-600 hover:text-red-900"
                                          title="Remover"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Add Intervalo Modal */}
                      {showAddIntervalo && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {editingIntervalo ? 'Editar Intervalo' : 'Adicionar Intervalo'}
                            </h3>
                            <form onSubmit={handleAddIntervalo} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Barbeiro (opcional)
                                </label>
                                <select
                                  value={newIntervalo.barbeiroId}
                                  onChange={(e) => setNewIntervalo({ ...newIntervalo, barbeiroId: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                >
                                  <option value="">Todos os barbeiros</option>
                                  {barbeiros.filter(b => b.ativo).map((barbeiro) => (
                                    <option key={barbeiro.id} value={barbeiro.id}>
                                      {barbeiro.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Dia da Semana
                                </label>
                                <select
                                  value={newIntervalo.diaSemana}
                                  onChange={(e) => setNewIntervalo({ ...newIntervalo, diaSemana: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                >
                                  <option value="">Selecione o dia</option>
                                  <option value="DOMINGO">Domingo</option>
                                  <option value="SEGUNDA">Segunda-feira</option>
                                  <option value="TERCA">Terça-feira</option>
                                  <option value="QUARTA">Quarta-feira</option>
                                  <option value="QUINTA">Quinta-feira</option>
                                  <option value="SEXTA">Sexta-feira</option>
                                  <option value="SABADO">Sábado</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Hora de Início
                                </label>
                                <input
                                  type="time"
                                  value={newIntervalo.horaInicio}
                                  onChange={(e) => setNewIntervalo({ ...newIntervalo, horaInicio: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Hora de Fim
                                </label>
                                <input
                                  type="time"
                                  value={newIntervalo.horaFim}
                                  onChange={(e) => setNewIntervalo({ ...newIntervalo, horaFim: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Data Específica (opcional)
                                </label>
                                <input
                                  type="date"
                                  value={newIntervalo.data}
                                  onChange={(e) => setNewIntervalo({ ...newIntervalo, data: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                  type="submit"
                                  className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                  {editingIntervalo ? 'Salvar' : 'Adicionar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddIntervalo(false);
                                    setEditingIntervalo(null);
                                    setNewIntervalo({
                                      barbeiroId: '',
                                      diaSemana: '',
                                      horaInicio: '',
                                      horaFim: '',
                                      data: ''
                                    });
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financeiro */}
                  {activeTab === 'financeiro' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Financeiro</h2>

                      {/* Pagamentos */}
                      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>
                        {loadingPagamentos ? (
                          <div className="text-center py-4">
                            <RefreshCw className="h-6 w-6 text-yellow-400 animate-spin mx-auto" />
                            <p className="text-gray-600">Carregando pagamentos...</p>
                          </div>
                        ) : pagamentos.length === 0 ? (
                          <p className="text-gray-500">Nenhum pagamento encontrado.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID Transação
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                  </th>
                                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {pagamentos.map((pagamento) => (
                                  <tr key={pagamento.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {pagamento.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatCurrency(pagamento.valor)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatDateTime(pagamento.dataCriacao)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${pagamento.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
                                        pagamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                        {pagamento.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Configurações */}
                  {activeTab === 'configuracoes' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

                      {/* Plan Status */}
                      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Plano</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Plano Atual</p>
                            <p className={`text-lg font-semibold ${dadosBarbearia.plano === 'STANDARD' ? 'text-green-600' :
                              dadosBarbearia.plano === 'PREMIUM' ? 'text-purple-600' :
                                'text-gray-600'
                              }`}>
                              {dadosBarbearia.plano === 'STANDARD' ? 'Plano Standard' :
                                dadosBarbearia.plano === 'PREMIUM' ? 'Plano Premium' :
                                  'Plano Básico'}
                            </p>
                            {dadosBarbearia.plano !== 'CLOSED' && dadosBarbearia.updatedAt && (
                              <p className="text-sm text-gray-500">
                                {calcularDiasRestantes(dadosBarbearia.updatedAt)} dias restantes
                              </p>
                            )}
                          </div>
                          {dadosBarbearia.plano === 'CLOSED' ? (
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <CreditCard className="h-5 w-5" />
                              <span>Ativar Plano</span>
                            </button>
                          ) : (
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                              <p className="text-green-800 font-medium">Plano Ativo</p>
                              <p className="text-green-600 text-sm">
                                Todas as funcionalidades disponíveis
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Barbearia Information */}
                      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Informações da Barbearia</h3>
                          {!isEditingBarbearia ? (
                            <button
                              onClick={() => setIsEditingBarbearia(true)}
                              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveBarbearia}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Salvar</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Cancelar</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Barbearia
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.nome : dadosBarbearia.nome}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, nome: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Proprietário
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.nomeProprietario : dadosBarbearia.nomeProprietario}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, nomeProprietario: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                value={isEditingBarbearia ? editedBarbearia.email : dadosBarbearia.email}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, email: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telefone
                              </label>
                              <input
                                type="tel"
                                value={isEditingBarbearia ? editedBarbearia.telefone : (dadosBarbearia.telefone || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, telefone: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.estado : (dadosBarbearia.estado || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, estado: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: Ceará"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cidade
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.cidade : (dadosBarbearia.cidade || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, cidade: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: Fortaleza"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CEP
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.cep : (dadosBarbearia.cep || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, cep: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: 60000-000"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bairro
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.bairro : (dadosBarbearia.bairro || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, bairro: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: Centro"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Complemento
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.complemento : (dadosBarbearia.complemento || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, complemento: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: Sala 101"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ponto de Referência
                              </label>
                              <input
                                type="text"
                                value={isEditingBarbearia ? editedBarbearia.pontoReferencia : (dadosBarbearia.pontoReferencia || '')}
                                onChange={(e) => isEditingBarbearia && setEditedBarbearia(prev => ({ ...prev, pontoReferencia: e.target.value }))}
                                readOnly={!isEditingBarbearia}
                                placeholder="Ex: Próximo ao shopping"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditingBarbearia ? 'bg-white' : 'bg-gray-50'}`}
                              />
                            </div>
                            {dadosBarbearia.id && !isEditingBarbearia && (
                              <>
                                <div>
                                  <ImageUpload
                                    barbeariaId={dadosBarbearia.id}
                                    type="logo"
                                    currentImageUrl={dadosBarbearia.logoUrl}
                                    onUploadSuccess={(newUrl) => setDadosBarbearia(prev => prev ? { ...prev, logoUrl: newUrl } : null)}
                                  />
                                </div>
                                <div>
                                  <ImageUpload
                                    barbeariaId={dadosBarbearia.id}
                                    type="banner"
                                    currentImageUrl={dadosBarbearia.bannerUrl}
                                    onUploadSuccess={(newUrl) => setDadosBarbearia(prev => prev ? { ...prev, bannerUrl: newUrl } : null)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Horários de Funcionamento */}
                      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
                        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Funcionamento</h3>
                          <div className="text-lg font-semibold text-gray-900">
                            <HorariosFuncionamento
                              barbeariaId={dadosBarbearia.id}
                              horarios={dadosBarbearia.horariosFuncionamento || []}
                              onHorariosUpdate={(horarios) => {
                                // Aqui você implementaria a lógica para atualizar os horários
                                console.log('Novos horários:', horarios);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          barbeariaId={dadosBarbearia?.id || 0}
          onPaymentSuccess={() => {
            // Lógica para atualizar o estado da barbearia após o pagamento
            // Por exemplo, recarregar os dados da barbearia para verificar o plano atualizado
            if (dadosBarbearia?.id) {
              apiService.getBarbeariaById(dadosBarbearia.id).then(barbeariaAtualizada => {
                setDadosBarbearia(barbeariaAtualizada);
                localStorage.setItem('barbeariaLogada', JSON.stringify(barbeariaAtualizada));
              }).catch(error => {
                console.error('Erro ao recarregar dados da barbearia após pagamento:', error);
              });
            }
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BarbershopDashboard;



