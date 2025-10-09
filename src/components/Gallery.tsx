import React from 'react';
import { CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

const Gallery = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Agendamentos Inteligentes',
      description: 'Sistema automatizado de agendamentos com controle de conflitos e confirmações via WhatsApp.'
    },
    {
      icon: Zap,
      title: 'IA Integrada',
      description: 'Assistente virtual que ajuda clientes e barbeiros com informações e suporte 24/7.'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Dados protegidos com criptografia e backup automático para total segurança.'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Avançados',
      description: 'Analytics completos para acompanhar o crescimento e performance da sua barbearia.'
    }
  ];

  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Funcionalidades <span className="text-yellow-400">Principais</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
            Descubra como nossa plataforma pode revolucionar a gestão da sua barbearia 
            com tecnologia de ponta e facilidade de uso.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;