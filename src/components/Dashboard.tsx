import React, { useState } from 'react';
import { User, CreditCard, LogIn } from 'lucide-react';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'barbershop',
      name: 'Já conto com os seus serviços',
      icon: <User className="h-4 w-4" />,
      description: 'Acesso para barbearias contratantes'
    },
    {
      id: 'register',
      name: 'Quero contar com seus serviços',
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Cadastrar minha barbearia'
    },
    {
      id: 'login',
      name: 'Já sou usuário',
      icon: <LogIn className="h-4 w-4" />,
      description: 'Login para clientes existentes'
    }
  ];

  const handleItemClick = (itemId: string) => {
    onPageChange(itemId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-400 text-black px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors duration-300 flex items-center space-x-2 text-sm sm:text-base"
      >
        <span className="hidden sm:inline">Dashboard</span>
        <span className="sm:hidden">Menu</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-start space-x-3"
              >
                <div className="text-yellow-500 mt-1">
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-xs sm:text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

