import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BarbershopDashboard from './pages/BarbershopDashboard';
import BarbershopLoginPage from './pages/BarbershopLoginPage';
import PaymentPage from './pages/PaymentPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ClientBookingPage from './pages/ClientBookingPage';
import BookingPage from './pages/BookingPage';
import { Barbearia, apiService } from './services/api';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [barbeariaLogada, setBarbeariaLogada] = useState<Barbearia | null>(null);
  const [barbeariaAgendamento, setBarbeariaAgendamento] = useState<Barbearia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se há uma sessão salva no localStorage
  useEffect(() => {
    const barbeariaData = localStorage.getItem('barbeariaLogada');
    if (barbeariaData) {
      try {
        const barbearia = JSON.parse(barbeariaData);
        setBarbeariaLogada(barbearia);
        setIsLoggedIn(true);

        // Se estamos na página de dashboard, manter na página
        const path = window.location.pathname;
        if (path === '/barbershop' || path.includes('barbershop')) {
          setCurrentPage('barbershop');
          return;
        }
      } catch (error) {
        console.error('Erro ao recuperar dados da barbearia:', error);
        localStorage.removeItem('barbeariaLogada');
      }
    }

    // Verificar se a URL contém um nomeUrl para agendamento
    checkForBookingUrl();
  }, []);

  // Escutar mudanças na URL (para navegação do browser)
  useEffect(() => {
    const handlePopState = () => {
      checkForBookingUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkForBookingUrl = async () => {
    const path = window.location.pathname;

    // Se a URL não é a raiz, pode ser um nomeUrl de barbearia ou página conhecida
    if (path !== '/' && path !== '') {
      const nomeUrl = path.substring(1); // Remove a barra inicial

      // Verificar se é uma das páginas conhecidas
      const knownPages = ['barbershop', 'payment', 'register', 'login', 'client-booking'];

      if (knownPages.includes(nomeUrl)) {
        setCurrentPage(nomeUrl);
        return;
      }

      // Se não é uma página conhecida, pode ser um nomeUrl de barbearia
      if (!knownPages.includes(nomeUrl)) {
        setLoading(true);
        setError(null);

        try {
          const barbearia = await apiService.getBarbeariaByNomeUrl(nomeUrl);
          setBarbeariaAgendamento(barbearia);
          setCurrentPage('booking');
        } catch (error) {
          console.error('Erro ao buscar barbearia:', error);
          setError('Barbearia não encontrada');
          setCurrentPage('home');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Se é a raiz, ir para home
      setCurrentPage('home');
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setError(null);
    if (page !== 'barbershop') {
      // Não limpar a sessão ao navegar para outras páginas
    }

    // Atualizar a URL
    if (page === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${page}`);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setError(null);
    setBarbeariaAgendamento(null);
    window.history.pushState({}, '', '/');
  };

  const handleBarbershopLogin = (barbearia: Barbearia) => {
    setIsLoggedIn(true);
    setBarbeariaLogada(barbearia);
    setCurrentPage('barbershop');
    window.history.pushState({}, '', '/barbershop');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setBarbeariaLogada(null);
    localStorage.removeItem('barbeariaLogada');
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  // Mostrar loading se estiver carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ops!</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleBackToHome}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Página de agendamento
  if (currentPage === 'booking' && barbeariaAgendamento) {
    return <BookingPage onBack={handleBackToHome} barbearia={barbeariaAgendamento} />;
  }

  if (currentPage === 'barbershop') {
    if (!isLoggedIn) {
      return <BarbershopLoginPage onBack={handleBackToHome} onLogin={handleBarbershopLogin} />;
    }
    return <BarbershopDashboard onBack={handleBackToHome} onLogout={handleLogout} barbearia={barbeariaLogada} />;
  }

  if (currentPage === 'payment') {
    return <PaymentPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onBack={handleBackToHome} onPageChange={handlePageChange} />;
  }

  if (currentPage === 'client-booking') {
    return <ClientBookingPage onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onPageChange={handlePageChange} />
      <Hero onPageChange={handlePageChange} />
      <Services onPageChange={handlePageChange} />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
