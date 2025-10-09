import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface HorariosFuncionamentoProps {
  barbeariaId: number;
  horarios?: Horario[]; // optional initial horarios passed from parent
  onHorariosUpdate?: (horarios: Horario[]) => void;
}

interface Horario {
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

const HorariosFuncionamento: React.FC<HorariosFuncionamentoProps> = ({ barbeariaId, horarios: propsHorarios, onHorariosUpdate }) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carregar horários existentes
  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setIsLoading(true);

        // If parent provided horarios prop, use it as initial source.
        // Handle both non-empty and empty arrays from parent.
        if (propsHorarios) {
          if (propsHorarios.length > 0) {
            setHorarios(propsHorarios);
          } else {
            // Parent provided empty array -> initialize defaults
            setHorarios(initializeDefaultHorarios());
          }
          setIsLoading(false);
          return;
        }

        // Use apiService to fetch horários (avoids relying on a global API_BASE_URL)
        const data = await apiService.getHorariosByBarbearia(barbeariaId);

        if (data && data.length > 0) {
          // Build full week ensuring days without entry are marked closed
          const mapa: Record<string, any> = {};
          data.forEach((h: any) => (mapa[h.diaSemana] = h));

          const fullWeek = diasSemana.map(d => ({
            diaSemana: d.key,
            horaInicio: mapa[d.key]?.horaInicio || '09:00',
            horaFim: mapa[d.key]?.horaFim || '18:00',
            ativo: !!mapa[d.key]
          }));

          setHorarios(fullWeek);
        } else {
          // Se não houver horários, inicializa com os padrões
          setHorarios(initializeDefaultHorarios());
        }
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setError('Erro ao carregar horários. Por favor, tente novamente.');
        setHorarios(initializeDefaultHorarios());
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorarios();
    // Re-run when barbeariaId or incoming horarios prop change
  }, [barbeariaId, propsHorarios]);

  // Função para inicializar horários padrão
  const initializeDefaultHorarios = (): Horario[] => {
    return diasSemana.map((dia) => ({
      diaSemana: dia.key,
      horaInicio: '09:00',
      horaFim: '18:00',
      ativo: dia.key !== 'DOMINGO', // Domingo fechado por padrão
    }));
  };

  // Atualizar horário específico
  const updateHorario = (index: number, field: keyof Horario, value: string | boolean) => {
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
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim
        }));

      // Usar a rota de horários ao invés de intervalos
      await apiService.updateHorariosBarbearia(barbeariaId, horariosAtivos);

      setSuccess('Horários salvos com sucesso!');
      setTimeout(() => setSuccess(null), 3000);

      // Notify parent if provided
      if (onHorariosUpdate) {
        onHorariosUpdate(horarios);
      }
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {isLoading ? (
        <div className="text-center dark:text-white">Carregando horários...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          {success && (
            <div className="mb-3 text-green-600">{success}</div>
          )}
          <div className="space-y-4">
            {diasSemana.map((dia, index) => (
              <div key={dia.key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-gray-900 dark:text-white font-medium w-full sm:w-32">
                    {dia.label}
                  </label>
                  <select
                    value={horarios[index]?.ativo ? 'ABERTO' : 'FECHADO'}
                    onChange={(e) => updateHorario(index, 'ativo', e.target.value === 'ABERTO')}
                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                  >
                    <option value="ABERTO" className="dark:text-gray-900">Aberto</option>
                    <option value="FECHADO" className="dark:text-gray-900">Fechado</option>
                  </select>

                  {horarios[index]?.ativo && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1 w-full">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-gray-600 dark:text-gray-200">Abertura</label>
                        <input
                          type="time"
                          value={horarios[index].horaInicio}
                          onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)}
                          className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-gray-600 dark:text-gray-200">Fechamento</label>
                        <input
                          type="time"
                          value={horarios[index].horaFim}
                          onChange={(e) => updateHorario(index, 'horaFim', e.target.value)}
                          className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
            >
              Resetar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-yellow-400 text-black rounded-md text-sm disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosFuncionamento;

