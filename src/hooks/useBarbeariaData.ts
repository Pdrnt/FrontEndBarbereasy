import { useState, useEffect } from 'react';
import { apiService, Barbearia, Barbeiro, Servico, Agendamento } from '../services/api';

export interface BarbeariaData {
  barbearia: Barbearia | null;
  barbeiros: Barbeiro[];
  servicos: Servico[];
  agendamentos: Agendamento[];
  isLoading: boolean;
  error: string | null;
}

export const useBarbeariaData = (barbeariaId: number | null) => {
  const [data, setData] = useState<BarbeariaData>({
    barbearia: null,
    barbeiros: [],
    servicos: [],
    agendamentos: [],
    isLoading: false,
    error: null,
  });

  const loadBarbeariaData = async (id: number) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [barbearia, barbeiros, servicos, agendamentos] = await Promise.all([
        apiService.getBarbeariaById(id),
        apiService.getBarbeirosByBarbearia(id),
        apiService.getServicosByBarbearia(id),
        apiService.getAgendamentosByBarbearia(id),
      ]);

      setData({
        barbearia,
        barbeiros,
        servicos,
        agendamentos,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados da barbearia:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao carregar dados',
      }));
    }
  };

  const addBarbeiro = async (barbeiro: { nome: string; especialidade: string }) => {
    if (!barbeariaId) return;

    try {
      const novoBarbeiro = await apiService.createBarbeiro({
        ...barbeiro,
        barbeariaId,
      });

      setData(prev => ({
        ...prev,
        barbeiros: [...prev.barbeiros, novoBarbeiro],
      }));

      return novoBarbeiro;
    } catch (error: any) {
      console.error('Erro ao adicionar barbeiro:', error);
      throw error;
    }
  };

  const updateBarbeiro = async (id: number, updates: { nome?: string; especialidade?: string; ativo?: boolean }) => {
    try {
      const barbeiroAtualizado = await apiService.updateBarbeiro(id, updates);

      setData(prev => ({
        ...prev,
        barbeiros: prev.barbeiros.map(b => b.id === id ? barbeiroAtualizado : b),
      }));

      return barbeiroAtualizado;
    } catch (error: any) {
      console.error('Erro ao atualizar barbeiro:', error);
      throw error;
    }
  };

  const removeBarbeiro = async (id: number) => {
    try {
      await apiService.deleteBarbeiro(id);

      setData(prev => ({
        ...prev,
        barbeiros: prev.barbeiros.filter(b => b.id !== id),
      }));
    } catch (error: any) {
      console.error('Erro ao remover barbeiro:', error);
      throw error;
    }
  };

  const addServico = async (servico: { nome: string; duracaoMin: number; preco: number }) => {
    if (!barbeariaId) return;

    try {
      const novoServico = await apiService.createServico({
        ...servico,
        barbeariaId,
      });

      setData(prev => ({
        ...prev,
        servicos: [...prev.servicos, novoServico],
      }));

      return novoServico;
    } catch (error: any) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
  };

  const updateServico = async (id: number, updates: { nome?: string; duracaoMin?: number; preco?: number }) => {
    try {
      const servicoAtualizado = await apiService.updateServico(id, updates);

      setData(prev => ({
        ...prev,
        servicos: prev.servicos.map(s => s.id === id ? servicoAtualizado : s),
      }));

      return servicoAtualizado;
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  };

  const removeServico = async (id: number) => {
    try {
      await apiService.deleteServico(id);

      setData(prev => ({
        ...prev,
        servicos: prev.servicos.filter(s => s.id !== id),
      }));
    } catch (error: any) {
      console.error('Erro ao remover serviço:', error);
      throw error;
    }
  };

  const updateAgendamento = async (id: number, updates: { status?: string; dataHora?: string }) => {
    try {
      const agendamentoAtualizado = await apiService.updateAgendamento(id, updates);

      setData(prev => ({
        ...prev,
        agendamentos: prev.agendamentos.map(a => a.id === id ? agendamentoAtualizado : a),
      }));

      return agendamentoAtualizado;
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  };

  const refreshData = () => {
    if (barbeariaId) {
      loadBarbeariaData(barbeariaId);
    }
  };

  useEffect(() => {
    if (barbeariaId) {
      loadBarbeariaData(barbeariaId);
    }
  }, [barbeariaId]);

  return {
    ...data,
    addBarbeiro,
    updateBarbeiro,
    removeBarbeiro,
    addServico,
    updateServico,
    removeServico,
    updateAgendamento,
    refreshData,
  };
};

