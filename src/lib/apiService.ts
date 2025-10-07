// Servicio API para conectar con el backend FastAPI
const API_BASE_URL = 'http://localhost:8000';

export interface Participante {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  unidad: string;
  activo: boolean;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  pagado_por: string;
  participantes: string[];
  creado_por: string;
}

  export interface Pago {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  deudor_id: string;
  acreedor_id: string;
  comprobante: string;
  creado_por: string;
}

export interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  unidad: string;
}

export interface Database {
  gastos: Gasto[];
  pagos: Pago[];
  participantes: Participante[];
  usuarioActual: UsuarioActual | null;
}

// Función genérica para hacer requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en API request:', error);
    throw error;
  }
}

// API para Participantes
export const participantesAPI = {
  getAll: (): Promise<Participante[]> => 
    apiRequest<Participante[]>('/participantes'),
  
  getById: (id: string): Promise<Participante> => 
    apiRequest<Participante>(`/participantes/${id}`),
  
  create: (participante: Omit<Participante, 'id'>): Promise<Participante> => 
    apiRequest<Participante>('/participantes', {
      method: 'POST',
      body: JSON.stringify({ ...participante, id: generateId() })
    }),
  
  update: (id: string, participante: Participante): Promise<Participante> => 
    apiRequest<Participante>(`/participantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(participante)
    }),
  
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/participantes/${id}`, {
      method: 'DELETE'
    })
};

// API para Gastos
export const gastosAPI = {
  getAll: (): Promise<Gasto[]> => 
    apiRequest<Gasto[]>('/gastos'),
  
  getById: (id: string): Promise<Gasto> => 
    apiRequest<Gasto>(`/gastos/${id}`),
  
  create: (gasto: Omit<Gasto, 'id'>): Promise<Gasto> => 
    apiRequest<Gasto>('/gastos', {
      method: 'POST',
      body: JSON.stringify({ ...gasto, id: generateId() })
    }),
  
  update: (id: string, gasto: Gasto): Promise<Gasto> => 
    apiRequest<Gasto>(`/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gasto)
    }),
  
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/gastos/${id}`, {
      method: 'DELETE'
    })
};

// API para Usuario Actual
export const usuarioAPI = {
  get: (): Promise<UsuarioActual> => 
    apiRequest<UsuarioActual>('/usuario-actual'),
  
  update: (usuario: UsuarioActual): Promise<UsuarioActual> => 
    apiRequest<UsuarioActual>('/usuario-actual', {
      method: 'PUT',
      body: JSON.stringify(usuario)
    })
};

// API para Pagos
export const pagosAPI = {
  getAll: (): Promise<Pago[]> => 
    apiRequest<Pago[]>('/pagos'),
  
  getById: (id: string): Promise<Pago> => 
    apiRequest<Pago>(`/pagos/${id}`),
  
  create: (pago: Omit<Pago, 'id'>): Promise<Pago> => 
    apiRequest<Pago>('/pagos', {
      method: 'POST',
      body: JSON.stringify({ ...pago, id: generateId() })
    }),
  
  update: (id: string, pago: Pago): Promise<Pago> => 
    apiRequest<Pago>(`/pagos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pago)
    }),
  
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/pagos/${id}`, {
      method: 'DELETE'
    })
};

// API para Base de Datos Completa
export const databaseAPI = {
  get: (): Promise<Database> => 
    apiRequest<Database>('/database')
};

// Utilidades
export const utilsAPI = {
  health: (): Promise<{ status: string; message: string }> => 
    apiRequest<{ status: string; message: string }>('/health')
};

// Función para generar ID único
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Función para verificar si el backend está disponible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await utilsAPI.health();
    return true;
  } catch (error) {
    console.warn('Backend no disponible:', error);
    return false;
  }
};
