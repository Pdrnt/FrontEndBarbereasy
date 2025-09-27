import React, { useState, useEffect } from 'react';
import { Clock, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { apiService, Horario } from '../services/api';

interface HorariosFuncionamentoProps {
  barbeariaId: number;
}

interface HorarioForm {
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

const diasSemana = [
  { key: 'SEGUNDA', label: 'Segunda-feira' },
  { key: 'TERCA', label: 'Terça-feira' },
  { key: 'QUARTA', label: 'Quarta-feira' },
  { key: 'QUINTA', label: 'Quinta-feira' },
  { key: 'SEXTA', label: 'Sexta-feira' },
  { key: 'SABADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
];

const HorariosFuncionamento: React.FC<HorariosFuncionamentoProps> = ({ barbeariaId }) => {
  const [horarios, setHorarios] = useState<HorarioForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inicializar horários padrão
  const initializeDefaultHorarios = () => {
    return diasSemana.map(dia => ({
      diaSemana: dia.key,
      horaInicio: '08:00',
      horaFim: '18:00',
      ativo: dia.key !== 'DOMINGO' // Domingo fechado por padrão
    }));
  };

  // Carregar horários existentes
  useEffect(() => {
    const loadHorarios = async () => {
      try {
        setIsLoading(true);
        const horariosExistentes = await apiService.getHorariosByBarbearia(barbeariaId);
        
        if (horariosExistentes.length === 0) {
          // Se não há horários, usar padrão
          setHorarios(initializeDefaultHorarios());
        } else {
          // Mapear horários existentes
          const horariosMap = new Map(
            horariosExistentes.map(h => [h.diaSemana, h])
          );

          const horariosForm = diasSemana.map(dia => {
            const horarioExistente = horariosMap.get(dia.key as any);
            return {
              diaSemana: dia.key,
              horaInicio: horarioExistente?.horaInicio || '08:00',
              horaFim: horarioExistente?.horaFim || '18:00',
              ativo: !!horarioExistente
            };
          });

          setHorarios(horariosForm);
        }
      } catch (error: any) {
        setError('Erro ao carregar horários: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHorarios();
  }, [barbeariaId]);

  // Atualizar horário específico
  const updateHorario = (index: number, field: keyof HorarioForm, value: string | boolean) => {
    const novosHorarios = [...horarios];
    novosHorarios[index] = {
      ...novosHorarios[index],
      [field]: value
    };
    setHorarios(novosHorarios);
    setError(null);
    setSuccess(null);
  };

  // Validar horários
  const validateHorarios = (): string | null => {
    for (const horario of horarios) {
      if (horario.ativo) {
        if (!horario.horaInicio || !horario.horaFim) {
          return 'Todos os horários ativos devem ter hora de início e fim';
        }
        
        if (horario.horaInicio >= horario.horaFim) {
          return 'A hora de início deve ser menor que a hora de fim';
        }
      }
    }
    return null;
  };

  // Salvar horários
  const handleSave = async () => {
    const validationError = validateHorarios();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Filtrar apenas horários ativos
      const horariosAtivos = horarios
        .filter(h => h.ativo)
        .map(h => ({
          diaSemana: h.diaSemana as any,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim
        }));

      // Enviar cada horário ativo individualmente para a nova rota de intervalos
      for (const horario of horariosAtivos) {
        await apiService.createIntervalo({
          barbeariaId: barbeariaId,
          barbeiroId: 1, // Assumindo um barbeiroId padrão, ajuste conforme necessário
          diaSemana: horario.diaSemana,
          horaInicio: horario.horaInicio,
          horaFim: horario.horaFim,
          data: null // 'data' é null para intervalos de funcionamento semanais
        });
      }
      setSuccess('Horários salvos com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError('Erro ao salvar horários: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Resetar para horários padrão
  const handleReset = () => {
    setHorarios(initializeDefaultHorarios());
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-2 text-gray-600">Carregando horários...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-gray-900">Horários de Funcionamento</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Resetar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full"></div>
          </div>
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        {horarios.map((horario, index) => {
          const dia = diasSemana.find(d => d.key === horario.diaSemana);
          return (
            <div key={horario.diaSemana} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={horario.ativo}
                  onChange={(e) => updateHorario(index, 'ativo', e.target.checked)}
                  className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-900 w-24">
                  {dia?.label}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-sm text-gray-600 min-w-[30px]">De:</label>
                  <input
                    type="time"
                    value={horario.horaInicio}
                    onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)}
                    disabled={!horario.ativo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-sm text-gray-600 min-w-[30px]">Até:</label>
                  <input
                    type="time"
                    value={horario.horaFim}
                    onChange={(e) => updateHorario(index, 'horaFim', e.target.value)}
                    disabled={!horario.ativo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {!horario.ativo && (
                <span className="text-sm text-gray-500 italic">Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Dica:</strong> Marque os dias em que sua barbearia funciona e defina os horários de abertura e fechamento.
          Os dias desmarcados aparecerão como "Fechado" para os clientes.
        </p>
      </div>
    </div>
  );
};

export default HorariosFuncionamento;

