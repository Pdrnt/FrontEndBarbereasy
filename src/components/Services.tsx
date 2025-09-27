import React from 'react';
import { MessageSquare, Calendar, Bot, BarChart3, Check, Star } from 'lucide-react';

interface ServicesProps {
  onPageChange?: (page: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onPageChange }) => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-yellow-400" />,
      title: 'Sistema de Agendamentos',
      description: 'Plataforma completa para gerenciar horários, clientes e serviços da sua barbearia.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-yellow-400" />,
      title: 'WhatsApp Integrado',
      description: 'Comunicação automática via WhatsApp entre barbeiros e clientes.',
    },
    {
      icon: <Bot className="h-8 w-8 text-yellow-400" />,
      title: 'IA Assistente',
      description: 'Inteligência artificial para auxiliar barbeiros e clientes com recomendações.',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-yellow-400" />,
      title: 'Relatórios e Analytics',
      description: 'Dashboard completo com métricas de desempenho e análise de dados.',
    },
  ];

  const allFeatures = [
    'Sistema completo de agendamentos',
    'Gestão de clientes e barbeiros',
    'Integração com WhatsApp',
    'Chat inteligente com IA',
    'Dashboard em tempo real',
    'URL personalizada para agendamentos',
    'Controle de horários de funcionamento',
    'Upload de logo e banner',
    'Suporte técnico especializado',
    'Relatórios e analytics avançados',
    'Notificações automáticas',
    'Backup automático dos dados'
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nossa <span className="text-yellow-400">Solução Completa</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Tudo que sua barbearia precisa em um único plano, com tecnologia de ponta 
            e suporte especializado.
          </p>
        </div>

        {/* Principais Recursos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group text-center"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Plano Único */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                OFERTA DE LANÇAMENTO
              </div>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-yellow-400 mr-2" />
                <h3 className="text-3xl font-bold text-yellow-400">Plano Standard</h3>
              </div>
              
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-2xl text-gray-400 line-through">R$ 189,90</span>
                <span className="text-5xl font-bold text-green-400">R$ 149,90</span>
                <span className="text-lg text-gray-300">/mês</span>
              </div>
              
              <p className="text-gray-300 text-lg">
                Tudo que sua barbearia precisa para crescer e se destacar no mercado
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold mb-4 text-yellow-400">Recursos Inclusos:</h4>
                <div className="space-y-3">
                  {allFeatures.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold mb-4 text-yellow-400">Benefícios Extras:</h4>
                <div className="space-y-3">
                  {allFeatures.slice(6).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => onPageChange && onPageChange('register')}
                className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-lg"
              >
                Começar Agora - R$ 149,90/mês
              </button>
              <p className="text-gray-400 text-sm mt-3">
                Sem taxa de adesão • Cancele quando quiser • Suporte 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;

