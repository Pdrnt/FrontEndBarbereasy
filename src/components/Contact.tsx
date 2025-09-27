import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você integraria com o backend para enviar o formulário
    console.log('Formulário enviado:', formData);
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Fale <span className="text-yellow-400">Conosco</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
           Nós envie uma mensagen ou tire suas dúvidas. Estamos aqui para revolucionar sua barbearia!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Informações de Contato</h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-400 text-black p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Telefone</h4>
                  <p className="text-gray-300 text-sm sm:text-base">(11) 99999-9999</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-400 text-black p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Email</h4>
                  <p className="text-gray-300 text-sm sm:text-base">vendas@barbereasy.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-400 text-black p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Horário de Funcionamento</h4>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Segunda à Sexta: 09:00 - 18:00<br />
                    Suporte 24/7 via chat<br />
                    Plataforma sempre online
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Para mais informações entre em contato</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nome da Barbearia"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Seu Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefone para Contato"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base"
                />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base"
                >
                  <option value="">Interesse em qual solução?</option>
                  <option value="agendamentos">Sistema de Agendamentos</option>
                  <option value="whatsapp">Integração WhatsApp</option>
                  <option value="ia">IA Assistente</option>
                  <option value="completo">Plataforma Completa</option>
                </select>
              </div>
              
              <textarea
                name="message"
                placeholder="Conte-nos sobre sua barbearia e suas necessidades"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-300 resize-none text-sm sm:text-base"
              ></textarea>
              
              <button
                type="submit"
                className="w-full bg-yellow-400 text-black py-3 sm:py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Send className="h-5 w-5" />
                <span>Envie sua mensagem</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;