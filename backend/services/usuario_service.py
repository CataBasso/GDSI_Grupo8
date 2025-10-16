"""
Servicio para la lógica de negocio del usuario actual
"""
from models.schemas import UsuarioActual, UsuarioActualUpdate
from database.connection import load_database, save_database
from services.participante_service import ParticipanteService
from fastapi import HTTPException


class UsuarioService:
    """Servicio para gestionar el usuario actual"""
    
    @staticmethod
    def get_current() -> UsuarioActual:
        """
        Obtener el usuario actual
        
        Returns:
            UsuarioActual: Usuario actual
            
        Raises:
            HTTPException: Si no hay usuario actual configurado
        """
        db = load_database()
        if not db.usuarioActual:
            raise HTTPException(status_code=404, detail="No hay usuario actual configurado")
        
        return db.usuarioActual
    
    @staticmethod
    def update(usuario_data: UsuarioActualUpdate) -> UsuarioActual:
        """
        Actualizar el usuario actual
        
        Args:
            usuario_data (UsuarioActualUpdate): Nuevos datos del usuario
            
        Returns:
            UsuarioActual: Usuario actualizado
            
        Raises:
            HTTPException: Si el usuario no existe en participantes
        """
        db = load_database()
        
        # Verificar que el usuario existe en participantes
        if not ParticipanteService.exists(usuario_data.id):
            raise HTTPException(
                status_code=400, 
                detail="El usuario debe existir en la lista de participantes"
            )
        
        # Crear el usuario actual
        usuario_actual = UsuarioActual(**usuario_data.model_dump())
        
        db.usuarioActual = usuario_actual
        save_database(db)
        
        return usuario_actual
    
    @staticmethod
    def set_current(participante_id: str) -> UsuarioActual:
        """
        Establecer un participante como usuario actual
        
        Args:
            participante_id (str): ID del participante a establecer como actual
            
        Returns:
            UsuarioActual: Usuario actual establecido
            
        Raises:
            HTTPException: Si el participante no existe
        """
        # Verificar que el participante existe
        participante = ParticipanteService.get_by_id(participante_id)
        
        # Crear el usuario actual
        usuario_actual = UsuarioActual(
            id=participante.id,
            nombre=participante.nombre,
            email=participante.email,
            unidad=participante.unidad
        )
        
        db = load_database()
        db.usuarioActual = usuario_actual
        save_database(db)
        
        return usuario_actual
    
    @staticmethod
    def clear_current() -> dict:
        """
        Limpiar el usuario actual
        
        Returns:
            dict: Mensaje de confirmación
        """
        db = load_database()
        db.usuarioActual = None
        save_database(db)
        
        return {"message": "Usuario actual limpiado correctamente"}
