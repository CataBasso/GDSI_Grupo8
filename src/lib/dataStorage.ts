import { Gasto, Participante } from "@/pages/Index";
import { databaseAPI, checkBackendHealth, participantesAPI, gastosAPI, usuarioAPI, Pago } from "./apiService";

export interface DataStorage {
  gastos: Gasto[];
  pagos: Pago[];
  participantes: Participante[];
  usuarioActual: {
    id: string;
    nombre: string;
    email: string;
    unidad: string;
  };
}

// Función para cargar datos desde el backend
export const loadData = async (): Promise<DataStorage> => {
  try {
    // Verificar si el backend está disponible
    const backendAvailable = await checkBackendHealth();
    
    if (backendAvailable) {
      console.log('Cargando datos desde el backend...');
      const data = await databaseAPI.get();
      
      // Convertir el formato del backend al formato del frontend
      return {
        gastos: data.gastos.map(gasto => {
          // Buscar el nombre del participante que pagó
          const participanteQuePago = data.participantes.find(p => p.id === gasto.pagado_por);
          const nombreParticipante = participanteQuePago ? participanteQuePago.nombre : 'Usuario desconocido';
          
          return {
            id: gasto.id,
            descripcion: gasto.descripcion,
            monto: gasto.monto,
            participante: nombreParticipante, // Convertir a formato del frontend
            fecha: gasto.fecha,
            categoria: gasto.categoria,
            comprobante: '' // Campo requerido por el frontend
          };
        }),
        pagos: data.pagos || [],
        participantes: data.participantes,
        usuarioActual: data.usuarioActual || {
          id: "user-1",
          nombre: "Usuario",
          email: "usuario@email.com",
          unidad: "1A"
        }
      };
    } else {
      console.log('Backend no disponible, cargando desde archivo local...');
      // Fallback al archivo local
      const response = await fetch('/data.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de datos');
      }
      const data: DataStorage = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
    
    // Intentar cargar desde localStorage como último recurso
    const localData = loadDataFromLocalStorage();
    if (localData) {
      console.log('Cargando datos desde localStorage...');
      return localData;
    }
    
    // Retornar datos por defecto si todo falla
    return {
      gastos: [],
      pagos: [],
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

// Función para guardar datos en el backend
export const saveData = async (data: DataStorage): Promise<void> => {
  try {
    const backendAvailable = await checkBackendHealth();
    
    if (backendAvailable) {
      console.log('Guardando datos en el backend...');
      
      // Obtener participantes existentes del backend
      const participantesExistentes = await participantesAPI.getAll();
      const idsParticipantesExistentes = new Set(participantesExistentes.map(p => p.id));
      
      // Crear solo los participantes nuevos
      for (const participante of data.participantes) {
        if (!idsParticipantesExistentes.has(participante.id)) {
          console.log(`Creando participante ${participante.id}...`);
          await participantesAPI.create(participante);
        }
      }
      
      // Obtener gastos existentes del backend
      const gastosExistentes = await gastosAPI.getAll();
      const idsExistentes = new Set(gastosExistentes.map(g => g.id));
      
      // Crear solo los gastos nuevos
      for (const gasto of data.gastos) {
        if (!idsExistentes.has(gasto.id)) {
          console.log(`Creando gasto ${gasto.id}...`);
          
          // Buscar el ID del participante por nombre
          const participanteQuePago = data.participantes.find(p => p.nombre === gasto.participante);
          const participanteId = participanteQuePago ? participanteQuePago.id : data.usuarioActual.id;
          
          // Para gastos de liquidación, incluir solo al deudor (quien paga)
          // Para gastos normales, incluir a todos los participantes activos
          const participantesInvolucrados = gasto.categoria === 'Liquidación' 
            ? [participanteId] // Solo el deudor paga (no se divide)
            : data.participantes.filter(p => p.activo).map(p => p.id); // Todos los participantes activos para gastos normales
          
          await gastosAPI.create({
            descripcion: gasto.descripcion,
            monto: gasto.monto,
            fecha: gasto.fecha,
            categoria: gasto.categoria,
            pagado_por: participanteId,
            participantes: participantesInvolucrados,
            creado_por: data.usuarioActual.id
          });
        }
      }
      
      // Actualizar usuario actual
      if (data.usuarioActual) {
        try {
          await usuarioAPI.update(data.usuarioActual);
        } catch (error) {
          console.log('Error actualizando usuario actual:', error);
        }
      }
      
      console.log('Datos guardados exitosamente en el backend');
    } else {
      console.log('Backend no disponible, guardando en localStorage...');
      localStorage.setItem('miconsorcio-data', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error guardando datos:', error);
    // Fallback a localStorage
    localStorage.setItem('miconsorcio-data', JSON.stringify(data));
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
