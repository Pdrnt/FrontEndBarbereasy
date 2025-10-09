import React from 'react';
import { Clock, Phone, Smartphone, Users, Calendar, MessageCircle } from 'lucide-react';

interface HeroProps {
  onPageChange: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onPageChange }) => {
  return (
    <section id="home" className="bg-gradient-to-r from-black to-gray-900 text-white py-16 sm:py-20 lg:py-24 mt-12 sm:mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
            Tecnologia & 
            <span className="text-yellow-400"> Inovação</span>
            <br />
            Para Sua Barbearia
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Revolucione sua barbearia com nossa plataforma completa de agendamentos, 
            comunicação via WhatsApp e IA integrada para barbeiros e clientes.
          </p>
          
          {/* Seção do Plano Único */}
          <div className="bg-gray-800 rounded-lg p-8 mb-12 border-2 border-yellow-400">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-yellow-400 mb-2">Plano Standard</h3>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-2xl text-gray-400 line-through">R$ 189,90</span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  OFERTA DE LANÇAMENTO
                </span>
              </div>
              <div className="text-5xl font-bold text-green-400 mb-4">
                R$ 149,90
                <span className="text-lg text-gray-300 font-normal">/mês</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 mb-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">Suporte 24/7</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <Phone className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">IA Integrada</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <Smartphone className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">App Mobile</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">Multi-usuário</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <Calendar className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">Agendamentos</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-yellow-400 p-4 rounded-full">
                  <MessageCircle className="h-8 w-8 text-black" />
                </div>
                <span className="text-sm font-medium">WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onPageChange('register')}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-lg"
            >
              Quero Contar com Seus Serviços
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

