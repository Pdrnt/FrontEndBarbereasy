import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, User, Scissors, Star, MapPin, Phone, CheckCircle, Info } from 'lucide-react';
import { Barbearia, Barbeiro, Servico, Cliente, apiService, formatCurrency, Horario } from '../services/api';

interface BookingPageProps {
  onBack: () => void;
  barbearia: Barbearia;
}

type BookingStep = 'date' | 'time' | 'service' | 'barber' | 'summary' | 'client' | 'confirmation';

const BookingPage: React.FC<BookingPageProps> = ({ onBack, barbearia }) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barbeiro | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervalos, setIntervalos] = useState<any[]>([]);
  
  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Mapeamento de DiaSemana para números de dia da semana (0=Dom, 1=Seg...)
  const diaSemanaMap: { [key: string]: number } = useMemo(() => ({
    'DOMINGO': 0,
    'SEGUNDA': 1,
    'TERCA': 2,
    'QUARTA': 3,
    'QUINTA': 4,
    'SEXTA': 5,
    'SABADO': 6,
  }), []);

  // Mapeamento de números de dia da semana para nomes curtos
  const dayNames = useMemo(() => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], []);
  const monthNames = useMemo(() => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], []);

  // Horários de funcionamento da barbearia
  const barbeariaHorarios = useMemo(() => {
    const horariosMap = new Map<number, Horario>();
    barbearia.horarios?.forEach(h => {
      horariosMap.set(diaSemanaMap[h.diaSemana], h);
    });
    return horariosMap;
  }, [barbearia.horarios, diaSemanaMap]);

  // Função auxiliar para obter a data/hora atual no fuso horário de São Paulo
  const getSaoPauloTime = () => {
    const now = new Date();
    const saoPauloOffset = -3; // UTC-3 para São Paulo
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * saoPauloOffset));
  };

  // Gerar próximos 30 dias úteis
  const generateAvailableDates = () => {
    const dates = [];
    const nowSaoPaulo = getSaoPauloTime();
    const todaySaoPaulo = new Date(nowSaoPaulo.getFullYear(), nowSaoPaulo.getMonth(), nowSaoPaulo.getDate());
    let currentDate = new Date(todaySaoPaulo);
    let daysAdded = 0;

    while (daysAdded < 30) { // Gerar 30 dias úteis futuros
      const dayOfWeek = currentDate.getDay();
      const isWorkingDay = barbeariaHorarios.has(dayOfWeek);

      if (isWorkingDay) {
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          dayName: dayNames[dayOfWeek],
          dayNumber: currentDate.getDate(),
          month: monthNames[currentDate.getMonth()],
          isToday: currentDate.getTime() === todaySaoPaulo.getTime(),
          isPastDay: currentDate.getTime() < todaySaoPaulo.getTime(),
          fullDate: new Date(currentDate),
          isWorkingDay: true,
        });
        daysAdded++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = useMemo(() => generateAvailableDates(), [barbeariaHorarios, dayNames, monthNames]);

  // Carregar horários disponíveis quando data e barbeiro são selecionados
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      loadAvailableTimes();
    }
  }, [selectedDate, selectedBarber]);

  // Carregar intervalos da barbearia
  useEffect(() => {
    const loadIntervalos = async () => {
      try {
        const intervalosData = await apiService.getIntervalosByBarbearia(barbearia.id);
        setIntervalos(intervalosData);
      } catch (error) {
        console.error('Erro ao carregar intervalos:', error);
      }
    };

    loadIntervalos();
  }, [barbearia.id]);

  const loadAvailableTimes = async () => {
    if (!selectedDate || !selectedBarber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const selectedDateObj = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = selectedDateObj.getDay();
      const horarioFuncionamento = barbeariaHorarios.get(dayOfWeek);

      if (!horarioFuncionamento) {
        setAvailableTimes([]);
        setError('Barbearia não funciona neste dia.');
        return;
      }

      const [startHour, startMinute] = horarioFuncionamento.horaInicio.split(':').map(Number);
      const [endHour, endMinute] = horarioFuncionamento.horaFim.split(':').map(Number);

      const allPossibleTimes: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        allPossibleTimes.push(timeString);

        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }

      const bookedTimes = await apiService.checkAvailability(barbearia.id, selectedBarber.id, selectedDate);
      
      const nowSaoPaulo = getSaoPauloTime();
      const todaySaoPauloISO = new Date(nowSaoPaulo.getFullYear(), nowSaoPaulo.getMonth(), nowSaoPaulo.getDate()).toISOString().split('T')[0];

      // Função para verificar se um horário está em intervalo
      const isTimeInInterval = (time: string): boolean => {
        const dayNames = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
        const dayName = dayNames[dayOfWeek];
        
        return intervalos.some(intervalo => {
          // Verifica se é um intervalo geral da barbearia ou específico do barbeiro
          const isGeneralInterval = !intervalo.barbeiroId;
          const isBarbeiroInterval = intervalo.barbeiroId === selectedBarber.id;
          
          if (!isGeneralInterval && !isBarbeiroInterval) {
            return false;
          }

          // Verifica se é para o dia da semana correto
          if (intervalo.diaSemana !== dayName) {
            return false;
          }

          // Verifica se o horário está dentro do intervalo
          const [timeHour, timeMinute] = time.split(':').map(Number);
          const [startHour, startMinute] = intervalo.horaInicio.split(':').map(Number);
          const [endHour, endMinute] = intervalo.horaFim.split(':').map(Number);

          const timeInMinutes = timeHour * 60 + timeMinute;
          const startInMinutes = startHour * 60 + startMinute;
          const endInMinutes = endHour * 60 + endMinute;

          return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
        });
      };

      const filteredTimes = allPossibleTimes.filter(time => {
        const isBooked = bookedTimes.includes(time);
        const isInInterval = isTimeInInterval(time);
        
        if (selectedDate === todaySaoPauloISO) {
          const [hour, minute] = time.split(':').map(Number);
          const slotDateTime = new Date(nowSaoPaulo.getFullYear(), nowSaoPaulo.getMonth(), nowSaoPaulo.getDate(), hour, minute, 0, 0);
          const thirtyMinutesFromNow = new Date(nowSaoPaulo.getTime() + (30 * 60 * 1000));

          return !isBooked && !isInInterval && slotDateTime.getTime() > thirtyMinutesFromNow.getTime();
        } else if (new Date(selectedDate) < new Date(todaySaoPauloISO)) {
          return false; // Não mostrar horários para dias passados
        }
        
        return !isBooked && !isInInterval;
      });

      setAvailableTimes(filteredTimes);
      
      if (filteredTimes.length === 0) {
        setError('Nenhum horário disponível para esta data e barbeiro.');
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setError('Erro ao carregar horários disponíveis. Tente novamente.');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string, isWorkingDay: boolean) => {
    if (!isWorkingDay) return;
    setSelectedDate(date);
    setSelectedTime(''); 
    setError(null);
    setCurrentStep('service');
  };

  const handleServiceSelect = (service: Servico) => {
    setSelectedService(service);
    setCurrentStep('barber');
  };

  const handleBarberSelect = (barbeiro: Barbeiro) => {
    setSelectedBarber(barbeiro);
    setSelectedTime(''); 
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('summary');
  };

  const handleConfirmBooking = () => {
    setCurrentStep('client');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Nome e telefone são obrigatórios');
      return;
    }

    if (!selectedDate || !selectedTime || !selectedService || !selectedBarber) {
      setError('Todos os dados do agendamento são obrigatórios');
      return;
    }

    setIsCreatingBooking(true);
    setError(null);

    const formattedPhone = `55${clientPhone.replace(/\D/g, '')}`;

    try {
      let cliente = await apiService.getClienteByTelefone(formattedPhone, barbearia.id);
      
      if (!cliente) {
        cliente = await apiService.createCliente({
          nome: clientName.trim(),
          telefone: formattedPhone,
          barbeariaId: barbearia.id
        });
      }

      // Criar string ISO mantendo o horário selecionado (sem conversão de fuso)
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hour, minute] = selectedTime.split(':').map(Number);
      
      // Criar string ISO manualmente para preservar o horário exato selecionado
      const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
      
      await apiService.createAgendamento({
        clienteId: cliente.id,
        barbeiroId: selectedBarber.id,
        barbeariaId: barbearia.id,
        dataHora: isoString,
        nomeServico: selectedService.nome,
        precoServico: selectedService.preco
      });

      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      setError(error.message || 'Erro ao criar agendamento');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleGoBack = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('date');
        setSelectedService(null);
        break;
      case 'barber':
        setCurrentStep('service');
        setSelectedBarber(null);
        break;
      case 'time':
        setCurrentStep('barber');
        setSelectedTime('');
        break;
      case 'summary':
        setCurrentStep('time');
        break;
      case 'client':
        setCurrentStep('summary');
        setClientName('');
        setClientPhone('');
        break;
      default:
        onBack(); // Volta para a página anterior se estiver na primeira etapa
        break;
    }
    setError(null); // Limpa erros ao voltar
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'date', label: 'Data', icon: Calendar },
      { key: 'service', label: 'Serviço', icon: Scissors },
      { key: 'barber', label: 'Barbeiro', icon: User },
      { key: 'time', label: 'Horário', icon: Clock },
      { key: 'summary', label: 'Resumo', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto py-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isActive ? 'bg-yellow-400 text-black' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`mt-2 text-xs text-center font-medium ${
                  isActive ? 'text-yellow-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderBarbershopInfo = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 text-center md:text-left">
      {barbearia.logoUrl && (
        <img 
          src={`${apiService.baseUrl}${barbearia.logoUrl}`} 
          alt={`${barbearia.nome} Logo`} 
          className="h-24 w-24 object-contain mx-auto md:mx-0 mb-4 rounded-full border-2 border-gray-100"
        />
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{barbearia.nome}</h2>
      <p className="text-gray-600 mb-4">Bem-vindo(a)! Agende seu horário conosco.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><Clock className="h-4 w-4 mr-2"/> Horário de Funcionamento:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {barbearia.horarios && barbearia.horarios.length > 0 ? (
              barbearia.horarios.map(h => (
                <li key={h.id}><strong>{h.diaSemana.charAt(0) + h.diaSemana.slice(1).toLowerCase()}:</strong> {h.horaInicio} - {h.horaFim}</li>
              ))
            ) : (
              <li>Horários não disponíveis.</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><Phone className="h-4 w-4 mr-2"/> Contato:</h4>
          <p className="text-sm text-gray-600">{barbearia.telefone || 'Não informado'}</p>
          
          {(barbearia.estado || barbearia.cidade || barbearia.cep || barbearia.bairro || barbearia.complemento || barbearia.pontoReferencia) && (
            <>
              <h4 className="font-semibold text-gray-800 mb-2 mt-4 flex items-center"><MapPin className="h-4 w-4 mr-2"/> Endereço:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {barbearia.estado && barbearia.cidade && (
                  <p>{barbearia.cidade}, {barbearia.estado}</p>
                )}
                {barbearia.cep && (
                  <p>CEP: {barbearia.cep}</p>
                )}
                {barbearia.bairro && (
                  <p>Bairro: {barbearia.bairro}</p>
                )}
                {barbearia.complemento && (
                  <p>Complemento: {barbearia.complemento}</p>
                )}
                {barbearia.pontoReferencia && (
                  <p>Referência: {barbearia.pontoReferencia}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderDateSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-yellow-400" />
        <span>Escolha a Data</span>
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
        {availableDates.map((date) => (
          <button
            key={date.date}
            onClick={() => handleDateSelect(date.date, date.isWorkingDay)}
            disabled={!date.isWorkingDay || date.isPastDay}
            className={`p-3 rounded-lg text-center transition-colors flex flex-col items-center justify-center ${
              selectedDate === date.date
                ? 'bg-yellow-400 text-black' : !date.isWorkingDay || date.isPastDay
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="text-xs font-medium">{date.dayName}</div>
            <div className="text-lg font-bold">{date.dayNumber}</div>
            <div className="text-xs">{date.month}</div>
            {date.isToday && (
              <div className="text-xs text-yellow-600 font-medium">Hoje</div>
            )}
          </button>
        ))}
      </div>
      {error && currentStep === 'date' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          <p className="text-red-600 text-sm flex items-center"><Info className="h-4 w-4 mr-2"/>{error}</p>
        </div>
      )}
    </div>
  );

  const renderServiceSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Scissors className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Serviço</span>
      </h3>
      <div className="space-y-3">
        {barbearia.servicos?.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              selectedService?.id === service.id
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h4 className="font-semibold text-gray-900">{service.nome}</h4>
                {service.detalhes && (
                  <p className="text-sm text-gray-500 mt-1">{service.detalhes}</p>
                )}
                <p className="text-sm text-gray-600">{service.duracaoMin} min</p>
              </div>
              <span className="font-bold text-gray-900 mt-2 sm:mt-0">{formatCurrency(service.preco)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBarberSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <User className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Barbeiro</span>
      </h3>
      <div className="space-y-3">
        {barbearia.barbeiros?.map((barbeiro) => (
          <button
            key={barbeiro.id}
            onClick={() => handleBarberSelect(barbeiro)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              selectedBarber?.id === barbeiro.id
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-lg">
                  {barbeiro.nome.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{barbeiro.nome}</h4>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Clock className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Horário</span>
      </h3>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando horários disponíveis...</p>
        </div>
      )}

      {!loading && availableTimes.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`p-3 rounded-lg text-center transition-colors ${
                selectedTime === time
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {!loading && availableTimes.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum horário disponível</p>
          <p className="text-sm text-gray-500 mt-2">Tente selecionar outro barbeiro ou data</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          <p className="text-red-600 text-sm flex items-center"><Info className="h-4 w-4 mr-2"/>{error}</p>
        </div>
      )}
    </div>
  );

  const renderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Data:</span>
          <span className="font-medium text-right">
            {selectedDate && availableDates.find(d => d.date === selectedDate)?.dayName}, {selectedDate && availableDates.find(d => d.date === selectedDate)?.dayNumber} de {selectedDate && availableDates.find(d => d.date === selectedDate)?.month}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Horário:</span>
          <span className="font-medium text-right">{selectedTime || 'Não selecionado'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Serviço:</span>
          <span className="font-medium text-right">{selectedService?.nome || 'Não selecionado'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Barbeiro:</span>
          <span className="font-medium text-right">{selectedBarber?.nome || 'Não selecionado'}</span>
        </div>
        <div className="flex justify-between border-t pt-4 mt-4">
          <span className="text-gray-600 text-lg">Valor Total:</span>
          <span className="font-bold text-xl text-yellow-600">
            {selectedService ? formatCurrency(selectedService.preco) : 'R$ 0,00'}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleConfirmBooking}
        className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors"
      >
        Confirmar Agendamento
      </button>
    </div>
  );

  const renderClientForm = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Identificação do Cliente</h3>
      
      <form onSubmit={handleClientSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Digite seu nome completo"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone (WhatsApp)
          </label>
          <input
            type="tel"
            id="phone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Ex: 89994582600 (apenas números)"
            pattern="[0-9]{11}"
            title="Por favor, insira um número de telefone válido com DDD (11 dígitos)."
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm flex items-center"><Info className="h-4 w-4 mr-2"/>{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isCreatingBooking}
          className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isCreatingBooking ? 'Criando Agendamento...' : 'Finalizar Agendamento'}
        </button>
      </form>
    </div>
  );

  const renderConfirmation = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h3>
      <p className="text-gray-600 mb-4">Seu agendamento foi realizado com sucesso. Você receberá uma confirmação via WhatsApp.</p>
      
      <div className="space-y-2 mb-6 text-left inline-block">
        <p className="text-gray-700"><span className="font-semibold">Barbearia:</span> {barbearia.nome}</p>
        <p className="text-gray-700"><span className="font-semibold">Data:</span> {selectedDate && availableDates.find(d => d.date === selectedDate)?.dayName}, {selectedDate && availableDates.find(d => d.date === selectedDate)?.dayNumber} de {selectedDate && availableDates.find(d => d.date === selectedDate)?.month}</p>
        <p className="text-gray-700"><span className="font-semibold">Horário:</span> {selectedTime}</p>
        <p className="text-gray-700"><span className="font-semibold">Serviço:</span> {selectedService?.nome}</p>
        <p className="text-gray-700"><span className="font-semibold">Barbeiro:</span> {selectedBarber?.nome}</p>
        <p className="text-gray-700"><span className="font-semibold">Valor:</span> {selectedService ? formatCurrency(selectedService.preco) : 'R$ 0,00'}</p>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors"
      >
        Voltar ao Início
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {renderBarbershopInfo()}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {currentStep !== 'confirmation' && (
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
          )}

          {renderStepIndicator()}

          {currentStep === 'date' && renderDateSelection()}
          {currentStep === 'service' && renderServiceSelection()}
          {currentStep === 'barber' && renderBarberSelection()}
          {currentStep === 'time' && renderTimeSelection()}
          {currentStep === 'summary' && renderSummary()}
          {currentStep === 'client' && renderClientForm()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

