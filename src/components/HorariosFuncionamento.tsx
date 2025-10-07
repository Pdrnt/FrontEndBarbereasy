import React, { useState, useEffect } from 'react';
import { Clock, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface HorariosFuncionamentoProps {
  barbeariaId: number;
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

const HorariosFuncionamento: React.FC<HorariosFuncionamentoProps> = ({ barbeariaId }) => {
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
        const response = await fetch(`${API_BASE_URL}/barbearias/${barbeariaId}/horarios`);

        if (!response.ok) {
          throw new Error('Falha ao carregar horários');
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setHorarios(data);
        } else {
          // Se não houver horários, inicializa com os padrões
          initializeDefaultHorarios();
        }
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setError('Erro ao carregar horários. Por favor, tente novamente.');
        initializeDefaultHorarios();
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorarios();
  }, [barbeariaId]);

  // Função para inicializar horários padrão
  const initializeDefaultHorarios = () => {
    const horariosIniciais = diasSemana.map((dia) => ({
      diaSemana: dia.key,
      horaInicio: '09:00',
      horaFim: '18:00',
      ativo: dia.key !== 'DOMINGO', // Domingo fechado por padrão
    }));
    setHorarios(horariosIniciais);
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
          barbeariaId: barbeariaId,
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim
        }));

      // Usar a rota de horários ao invés de intervalos
      await apiService.updateHorariosBarbearia(barbeariaId, horariosAtivos);

      setSuccess('Horários salvos com sucesso!');
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {isLoading ? (
        <div className="text-center dark:text-white">Carregando horários...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
          <div className="space-y-4">
            {diasSemana.map((dia, index) => (
              <div key={dia.key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <label className="text-gray-900 dark:text-white font-medium w-32">
                    {dia.label}
                  </label>
                  <select
                    value={horarios[index]?.ativo ? 'ABERTO' : 'FECHADO'}
                    onChange={(e) => updateHorario(index, 'ativo', e.target.value === 'ABERTO')}
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                  >
                    <option value="ABERTO" className="dark:text-gray-900">Aberto</option>
                    <option value="FECHADO" className="dark:text-gray-900">Fechado</option>
                  </select>

                  {horarios[index]?.ativo && (
                    <div className="flex gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-gray-600 dark:text-gray-200">Abertura</label>
                        <input
                          type="time"
                          value={horarios[index].horaInicio}
                          onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-600 dark:text-gray-200">Fechamento</label>
                        <input
                          type="time"
                          value={horarios[index].horaFim}
                          onChange={(e) => updateHorario(index, 'horaFim', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosFuncionamento;

