import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Clock, Calendar, User, Scissors } from 'lucide-react';

interface BarbershopDetailsPageProps {
  onBack: () => void;
  barbershop: {
    id: number;
    name: string;
    rating: number;
    address: string;
    phone: string;
    image: string;
    price: string;
  };
  isRescheduling?: boolean;
  originalAppointment?: {
    id: number;
    service: string;
    professional: string;
    date: string;
    time: string;
  };
}

const BarbershopDetailsPage: React.FC<BarbershopDetailsPageProps> = ({ 
  onBack, 
  barbershop, 
  isRescheduling = false, 
  originalAppointment 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const services = [
    { id: 'corte', name: 'Corte Simples', duration: '30 min', price: 'R$ 35' },
    { id: 'barba', name: 'Barba', duration: '20 min', price: 'R$ 25' },
    { id: 'corte-barba', name: 'Corte + Barba', duration: '45 min', price: 'R$ 50' },
    { id: 'sobrancelha', name: 'Sobrancelha', duration: '15 min', price: 'R$ 15' },
    { id: 'relaxamento', name: 'Relaxamento', duration: '60 min', price: 'R$ 80' },
    { id: 'tratamento', name: 'Tratamento Capilar', duration: '40 min', price: 'R$ 60' }
  ];

  const professionals = [
    { id: 'carlos', name: 'Carlos Silva', rating: 4.9, specialty: 'Cortes Modernos' },
    { id: 'joao', name: 'João Santos', rating: 4.8, specialty: 'Barbas Clássicas' },
    { id: 'pedro', name: 'Pedro Lima', rating: 4.7, specialty: 'Tratamentos' },
    { id: 'rafael', name: 'Rafael Costa', rating: 4.9, specialty: 'Cortes & Barbas' }
  ];

  // Gerar próximos 14 dias
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return dates;
  };

  const availableDates = generateDates();

  // Horários disponíveis (simulado)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // 70% dos horários disponíveis
        slots.push({ time, isAvailable });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleBooking = () => {
    if (!selectedDate || !selectedService || !selectedProfessional || !selectedTime) {
      alert('Por favor, selecione todos os campos obrigatórios.');
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
    const selectedDateData = availableDates.find(d => d.date === selectedDate);

    const bookingData = {
      barbershop: barbershop.name,
      service: selectedServiceData?.name,
      professional: selectedProfessionalData?.name,
      date: `${selectedDateData?.dayNumber}/${selectedDateData?.month}`,
      time: selectedTime,
      price: selectedServiceData?.price,
      isRescheduling
    };

    console.log('Dados do agendamento:', bookingData);
    
    if (isRescheduling) {
      alert('Reagendamento realizado com sucesso!');
    } else {
      alert('Agendamento realizado com sucesso!');
    }
    
    onBack();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isRescheduling ? 'Reagendar' : 'Agendar'} Serviço
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Informações da Barbearia */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start space-x-4">
            <img
              src={barbershop.image}
              alt={barbershop.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{barbershop.name}</h2>
                <div className="flex items-center space-x-1">
                  {renderStars(barbershop.rating)}
                  <span className="text-sm text-gray-600 ml-1">({barbershop.rating})</span>
                </div>
              </div>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{barbershop.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{barbershop.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agendamento Original (se for reagendamento) */}
        {isRescheduling && originalAppointment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamento Atual</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Serviço:</strong> {originalAppointment.service}</p>
                <p><strong>Profissional:</strong> {originalAppointment.professional}</p>
              </div>
              <div>
                <p><strong>Data:</strong> {originalAppointment.date}</p>
                <p><strong>Horário:</strong> {originalAppointment.time}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seleção de Data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <span>Escolha a Data</span>
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  disabled={date.isWeekend}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedDate === date.date
                      ? 'bg-yellow-400 text-black'
                      : date.isWeekend
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
          </div>

          {/* Seleção de Horário */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Horário</span>
            </h3>
            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">
                Selecione uma data primeiro
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.isAvailable}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-yellow-400 text-black'
                        : slot.isAvailable
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Seleção de Serviço */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Serviço</span>
            </h3>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedService === service.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <span className="font-bold text-gray-900">{service.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Profissional */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Profissional</span>
            </h3>
            <div className="space-y-3">
              {professionals.map((professional) => (
                <button
                  key={professional.id}
                  onClick={() => setSelectedProfessional(professional.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedProfessional === professional.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                      <p className="text-sm text-gray-600">{professional.specialty}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(professional.rating)}
                        <span className="text-xs text-gray-600">({professional.rating})</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo e Confirmação */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Barbearia:</span>
                <span className="font-medium">{barbershop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {selectedDate ? 
                    availableDates.find(d => d.date === selectedDate)?.dayNumber + '/' + 
                    availableDates.find(d => d.date === selectedDate)?.month 
                    : 'Não selecionada'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{selectedTime || 'Não selecionado'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">
                  {selectedService ? services.find(s => s.id === selectedService)?.name : 'Não selecionado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium">
                  {selectedProfessional ? professionals.find(p => p.id === selectedProfessional)?.name : 'Não selecionado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-bold text-lg text-yellow-600">
                  {selectedService ? services.find(s => s.id === selectedService)?.price : 'R$ 0'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedService || !selectedProfessional || !selectedTime}
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isRescheduling ? 'Confirmar Reagendamento' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarbershopDetailsPage;