import { Gasto, Participante } from "@/pages/Index";

export interface DataStorage {
  gastos: Gasto[];
  participantes: Participante[];
  usuarioActual: {
    id: string;
    nombre: string;
    email: string;
    unidad: string;
  };
}

// Función para cargar datos desde el archivo JSON
export const loadData = async (): Promise<DataStorage> => {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de datos');
    }
    const data: DataStorage = await response.json();
    return data;
  } catch (error) {
    console.error('Error cargando datos:', error);
    // Retornar datos por defecto si hay error
    return {
      gastos: [],
      participantes: [],
      usuarioActual: {
        id: "user-1",
        nombre: "Usuario",
        email: "usuario@email.com",
        unidad: "1A"
      }
    };
  }
};

// Función para guardar datos (simulada - en una app real sería una API)
export const saveData = async (data: DataStorage): Promise<void> => {
  try {
    // En una aplicación real, aquí harías una llamada a tu API
    // Por ahora, solo guardamos en localStorage como respaldo
    localStorage.setItem('miconsorcio-data', JSON.stringify(data));
    console.log('Datos guardados en localStorage');
  } catch (error) {
    console.error('Error guardando datos:', error);
  }
};

// Función para cargar datos desde localStorage (respaldo)
export const loadDataFromLocalStorage = (): DataStorage | null => {
  try {
    const data = localStorage.getItem('miconsorcio-data');
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error cargando datos desde localStorage:', error);
    return null;
  }
};

// Función para generar un ID único
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
