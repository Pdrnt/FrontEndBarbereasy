import React from 'react';
import { Scissors, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              <span className="text-xl sm:text-2xl font-bold">BarberEasy</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
              Renovando o mercado de barbearia com tecnologia para comprovar resultados
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="bg-gray-800 p-2 sm:p-3 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Soluções</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300 block">Sistema de Agendamentos</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300 block">WhatsApp Integrado</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300 block">IA Assistente</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300 block">Analytics Avançado</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Links Rápidos</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li><a href="#home" className="hover:text-yellow-400 transition-colors duration-300 block">Início</a></li>
              <li><a href="#about" className="hover:text-yellow-400 transition-colors duration-300 block">Sobre</a></li>
              <li><a href="#gallery" className="hover:text-yellow-400 transition-colors duration-300 block">Galeria</a></li>
              <li><a href="#contact" className="hover:text-yellow-400 transition-colors duration-300 block">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Contato</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li>(86) 99832-2414</li>
              <li>vendas@barbereasy.com</li>
              <li></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            &copy; 2025 BarberEasy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;