import React from 'react';
import { Award, Clock, Users, Zap } from 'lucide-react';

const About = () => {
  const stats = [ ];

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Sobre a <span className="text-yellow-400">BarberEasy</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Viemos para revolucionar o setor de barbearias com tecnologia inovadora. 
              Nossa plataforma combina agendamentos inteligentes, comunicação via WhatsApp e 
              IA para oferecer a melhor experiência para barbeiros e clientes.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Nossa equipe de desenvolvedores e especialistas em UX está sempre inovando, 
              utilizando as mais modernas tecnologias para garantir que sua barbearia 
              tenha as melhores ferramentas do mercado.
            </p>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-yellow-400 text-black w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <img
              src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Dashboard da plataforma"
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg shadow-lg"
            />
            <img
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Interface mobile"
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg shadow-lg mt-4 sm:mt-6 lg:mt-8"
            />
            <img
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Analytics e relatórios"
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg shadow-lg -mt-4 sm:-mt-6 lg:-mt-8"
            />
            <img
              src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Integração WhatsApp"
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;