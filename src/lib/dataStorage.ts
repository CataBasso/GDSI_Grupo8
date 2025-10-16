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
          comprobante: gasto.comprobante || null // Manejar comprobante nulo
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
  } catch (error) {
    console.error('Error cargando datos desde el backend:', error);
    throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose en http://localhost:8000');
  }
};

// Función para guardar datos en el backend
export const saveData = async (data: DataStorage): Promise<void> => {
  try {
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
          creado_por: data.usuarioActual.id,
          comprobante: gasto.comprobante
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
  } catch (error) {
    console.error('Error guardando datos:', error);
    throw new Error('No se pudo guardar los datos en el servidor. Asegúrate de que el backend esté ejecutándose.');
  }
};


// Función para generar un ID único
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
