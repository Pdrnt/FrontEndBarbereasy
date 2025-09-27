import React, { useState } from 'react';
import { Menu, X, Scissors } from 'lucide-react';
import Dashboard from './Dashboard';

interface HeaderProps {
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Início', href: '#home' },
    { name: 'Serviços', href: '#services' },
    { name: 'Sobre', href: '#about' },
    { name: 'Galeria', href: '#gallery' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
            <span className="text-lg sm:text-2xl font-bold">BarberEasy</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-yellow-400 transition-colors duration-300 font-medium text-sm xl:text-base"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Dashboard onPageChange={onPageChange} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-3 hover:text-yellow-400 transition-colors duration-300 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="mt-4">
              <Dashboard onPageChange={onPageChange} />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;