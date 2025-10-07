const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Tipos para as entidades
export interface Barbearia {
  id: number;
  nome: string;
  nomeProprietario: string;
  email: string;
  telefone?: string;
  nomeUrl: string;
  plano: string;
  logoUrl?: string;
  bannerUrl?: string;
  ativa: boolean;
  createdAt: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  bairro?: string;
  complemento?: string;
  pontoReferencia?: string;
  barbeiros?: Barbeiro[];
  servicos?: Servico[];
  clientes?: Cliente[];
  agendamentos?: Agendamento[];
  horarios?: Horario[];
}

export interface Horario {
  id: number;
  diaSemana: 'DOMINGO' | 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO';
  horaInicio: string;
  horaFim: string;
  barbeariaId: number;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  status: string;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
    nomeProprietario: string;
  };
}

export interface Barbeiro {
  id: number;
  nome: string;
  especialidade: string;
  ativo: boolean;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
  };
  agendamentos?: Agendamento[];
}

export interface Servico {
  id: number;
  nome: string;
  duracaoMin: number;
  preco: number;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
  };
}

export interface Agendamento {
  id: number;
  dataHora: string;
  status: string;
  nomeServico: string;
  precoServico: number;
  clienteId: number;
  barbeiroId: number;
  barbeariaId: number;
  cliente?: {
    id: number;
    nome: string;
    telefone: string;
  };
  barbeiro?: {
    id: number;
    nome: string;
    especialidade?: string;
  };
  barbearia?: {
    id: number;
    nome: string;
  };
}

// Classe para gerenciar as chamadas da API
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Métodos para Barbearias
  async createBarbearia(data: {
    nome: string;
    nomeProprietario: string;
    email: string;
    senha: string;
    telefone?: string;
    nomeUrl?: string;
    plano?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }): Promise<Barbearia> {
    return this.request<Barbearia>('/barbearias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBarbeariaById(id: number): Promise<Barbearia> {
    return this.request<Barbearia>(`/barbearias/${id}`);
  }

  async getBarbeariaByNomeUrl(nomeUrl: string): Promise<Barbearia> {
    return this.request<Barbearia>(`/barbearias/url/${nomeUrl}`);
  }

  async loginBarbearia(data: {
    email: string;
    senha: string;
  }): Promise<{ message: string; barbearia: Barbearia }> {
    return this.request<{ message: string; barbearia: Barbearia }>('/barbearias/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBarbearia(id: number, data: {
    nome?: string;
    nomeProprietario?: string;
    email?: string;
    telefone?: string;
    estado?: string;
    cidade?: string;
    cep?: string;
    bairro?: string;
    complemento?: string;
    pontoReferencia?: string;
  }): Promise<Barbearia> {
    return this.request<Barbearia>(`/barbearias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getIntervalosByBarbearia(barbeariaId: number): Promise<any[]> {
    return this.request<any[]>(`/intervalos/barbearia/${barbeariaId}`);
  }

  async createIntervalo(data: {
    barbeariaId: number;
    barbeiroId: number;
    diaSemana: string;
    horaInicio: string;
    horaFim: string;
    data: string | null;
  }): Promise<any> {
    return this.request<any>("/intervalos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Métodos para Clientes
  async createCliente(data: {
    nome: string;
    telefone: string;
    barbeariaId: number;
  }): Promise<Cliente> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginByTelefone(telefone: string): Promise<{
    cliente: {
      id: number;
      nome: string;
      telefone: string;
      status: string;
    };
    barbearia: Barbearia;
    agendamentos: {
      ativos: Agendamento[];
      historico: Agendamento[];
      total: number;
    };
    estatisticas: {
      totalAgendamentos: number;
      agendamentosAtivos: number;
      agendamentosFinalizados: number;
      agendamentosCancelados: number;
    };
  }> {
    return this.request<{
      cliente: {
        id: number;
        nome: string;
        telefone: string;
        status: string;
      };
      barbearia: Barbearia;
      agendamentos: {
        ativos: Agendamento[];
        historico: Agendamento[];
        total: number;
      };
      estatisticas: {
        totalAgendamentos: number;
        agendamentosAtivos: number;
        agendamentosFinalizados: number;
        agendamentosCancelados: number;
      };
    }>('/clientes/login', {
      method: 'POST',
      body: JSON.stringify({ telefone }),
    });
  }

  async getClienteById(id: number): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/${id}`);
  }

  async getClienteByTelefone(telefone: string, barbeariaId: number): Promise<Cliente | null> {
    try {
      const clientes = await this.request<Cliente[]>(`/clientes?telefone=${telefone}&barbeariaId=${barbeariaId}`);
      return clientes.length > 0 ? clientes[0] : null;
    } catch (error) {
      return null;
    }
  }

  // Métodos para Barbeiros
  async createBarbeiro(data: {
    nome: string;
    especialidade: string;
    barbeariaId: number;
  }): Promise<Barbeiro> {
    return this.request<Barbeiro>('/barbeiros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllBarbeiros(): Promise<Barbeiro[]> {
    return this.request<Barbeiro[]>('/barbeiros');
  }

  async getBarbeiroById(id: number): Promise<Barbeiro> {
    return this.request<Barbeiro>(`/barbeiros/${id}`);
  }

  async getBarbeirosByBarbearia(barbeariaId: number): Promise<Barbeiro[]> {
    return this.request<Barbeiro[]>(`/barbeiros/barbearia/${barbeariaId}`);
  }

  async updateBarbeiro(id: number, data: {
    nome?: string;
    especialidade?: string;
    ativo?: boolean;
  }): Promise<Barbeiro> {
    return this.request<Barbeiro>(`/barbeiros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBarbeiro(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/barbeiros/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Serviços
  async createServico(data: {
    nome: string;
    duracaoMin: number;
    preco: number;
    barbeariaId: number;
  }): Promise<Servico> {
    return this.request<Servico>('/servicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllServicos(): Promise<Servico[]> {
    return this.request<Servico[]>('/servicos');
  }

  async getServicoById(id: number): Promise<Servico> {
    return this.request<Servico>(`/servicos/${id}`);
  }

  async getServicosByBarbearia(barbeariaId: number): Promise<Servico[]> {
    return this.request<Servico[]>(`/servicos/barbearia/${barbeariaId}`);
  }

  async updateServico(id: number, data: {
    nome?: string;
    duracaoMin?: number;
    preco?: number;
  }): Promise<Servico> {
    return this.request<Servico>(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteServico(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/servicos/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Agendamentos
  async createAgendamento(data: {
    clienteId: number;
    barbeiroId: number;
    barbeariaId: number;
    dataHora: string;
    nomeServico: string;
    precoServico: number;
    status?: string;
  }): Promise<Agendamento> {
    return this.request<Agendamento>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgendamentoById(id: number): Promise<Agendamento> {
    return this.request<Agendamento>(`/agendamentos/${id}`);
  }

  async getAgendamentosByCliente(clienteId: number): Promise<Agendamento[]> {
    return this.request<Agendamento[]>(`/agendamentos/cliente/${clienteId}`);
  }

  async getAgendamentosByBarbearia(barbeariaId: number, status?: string): Promise<Agendamento[]> {
    const queryParam = status ? `?status=${status}` : '';
    return this.request<Agendamento[]>(`/agendamentos/barbearia/${barbeariaId}${queryParam}`);
  }

  async updateAgendamento(id: number, data: {
    status?: string;
    dataHora?: string;
  }): Promise<Agendamento> {
    return this.request<Agendamento>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async checkAvailability(barbeariaId: number, barbeiroId: number, data: string): Promise<string[]> {
    try {
      const agendamentos = await this.getAgendamentosByBarbearia(barbeariaId);
      const dataAgendamentos = agendamentos.filter(ag =>
        ag.barbeiroId === barbeiroId &&
        ag.dataHora.startsWith(data) &&
        (ag.status === 'AGENDAMENTO_PROGRAMADO' || ag.status === 'AGENDAMENTO_CONFIRMADO')
      );

      const horariosOcupados = dataAgendamentos.map(ag => {
        // Extrair hora e minuto da string ISO usando UTC (já que salvamos como UTC)
        const dateObj = new Date(ag.dataHora);
        const hora = String(dateObj.getUTCHours()).padStart(2, '0');
        const minuto = String(dateObj.getUTCMinutes()).padStart(2, '0');
        return `${hora}:${minuto}`;
      });

      return horariosOcupados;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return [];
    }
  }

  // Método para verificar status do WhatsApp
  async getWhatsAppStatus(): Promise<{
    connected: boolean;
    message: string;
    features: string[];
  }> {
    return this.request<{
      connected: boolean;
      message: string;
      features: string[];
    }>('/whatsapp/status');
  }

  // Métodos para horários de funcionamento
  async getHorariosByBarbearia(barbeariaId: number): Promise<Horario[]> {
    return this.request<Horario[]>(`/barbearias/${barbeariaId}/horarios`);
  }

  async createOrUpdateHorarios(barbeariaId: number, horarios: Omit<Horario, 'id' | 'barbeariaId'>[]): Promise<{
    message: string;
    quantidade: number;
  }> {
    return this.request<{
      message: string;
      quantidade: number;
    }>(`/barbearias/${barbeariaId}/horarios`, {
      method: 'POST',
      body: JSON.stringify({ horarios }),
    });
  }

  async updateHorario(barbeariaId: number, horarioId: number, data: {
    diaSemana?: string;
    horaInicio?: string;
    horaFim?: string;
  }): Promise<Horario> {
    return this.request<Horario>(`/barbearias/${barbeariaId}/horarios/${horarioId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHorario(barbeariaId: number, horarioId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/barbearias/${barbeariaId}/horarios/${horarioId}`, {
      method: 'DELETE',
    });
  }

  // Métodos para upload de imagens
  async uploadLogo(barbeariaId: number, file: File): Promise<{
    message: string;
    logoUrl: string;
    filename: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${this.baseUrl}/barbearias/${barbeariaId}/upload/logo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async uploadBanner(barbeariaId: number, file: File): Promise<{
    message: string;
    bannerUrl: string;
    filename: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await fetch(`${this.baseUrl}/barbearias/${barbeariaId}/upload/banner`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Métodos para obter URLs das imagens
  getLogoUrl(barbeariaId: number, logoUrl: string): string {
    return `${this.baseUrl}${logoUrl}`;
  }

  getBannerUrl(barbeariaId: number, bannerUrl: string): string {
    return `${this.baseUrl}${bannerUrl}`;
  }

  // Métodos para pagamentos
  async gerarPix(barbeariaId: number): Promise<{
    message: string;
    pagamento: {
      id: number;
      mercadoPagoId: string;
      valor: number;
      status: string;
      qrCode?: string;
      qrCodeBase64?: string;
      pixCopyPaste?: string;
    };
  }> {
    return this.request<{
      message: string;
      pagamento: {
        id: number;
        mercadoPagoId: string;
        valor: number;
        status: string;
        qrCode?: string;
        qrCodeBase64?: string;
        pixCopyPaste?: string;
      };
    }>('/pagamentos/gerar-pix', {
      method: 'POST',
      body: JSON.stringify({ barbeariaId }),
    });
  }

  async consultarPagamento(pagamentoId: number): Promise<{
    pagamento: {
      id: number;
      mercadoPagoId: string;
      valor: number;
      status: string;
      createdAt: string;
    };
  }> {
    return this.request<{
      pagamento: {
        id: number;
        mercadoPagoId: string;
        valor: number;
        status: string;
        createdAt: string;
      };
    }>(`/pagamentos/${pagamentoId}`);
  }

  async getPagamentosByBarbearia(barbeariaId: number): Promise<{
    id: number;
    mercadoPagoId: string;
    valor: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[]> {
    return this.request<{
      id: number;
      mercadoPagoId: string;
      valor: number;
      status: string;
      createdAt: string;
      updatedAt: string;
    }[]>(`/pagamentos/barbearia/${barbeariaId}`);
  }

  // Método para atualizar horários da barbearia
  async updateHorariosBarbearia(barbeariaId: number, horarios: any[]) {
    return this.request(`/barbearias/${barbeariaId}/horarios`, {
      method: 'POST',
      body: JSON.stringify({ horarios })
    });
  }
}

// Instância única do serviço
export const apiService = new ApiService();

// Funções utilitárias
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Certifique-se que o método getHorariosByBarbearia está implementado corretamente
export const getHorariosByBarbearia = async (barbeariaId: number): Promise<Horario[]> => {
  try {
    const response = await api.get(`/barbearias/${barbeariaId}/horarios`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    throw error;
  }
};

