"""
Servicio para la lógica de negocio de participantes
"""
from typing import List, Optional
from models.schemas import Participante, ParticipanteCreate
from database.connection import load_database, save_database
from fastapi import HTTPException


class ParticipanteService:
    """Servicio para gestionar participantes"""
    
    @staticmethod
    def get_all() -> List[Participante]:
        """
        Obtener todos los participantes
        
        Returns:
            List[Participante]: Lista de todos los participantes
        """
        db = load_database()
        return db.participantes
    
    @staticmethod
    def get_by_id(participante_id: str) -> Participante:
        """
        Obtener un participante por ID
        
        Args:
            participante_id (str): ID del participante
            
        Returns:
            Participante: Participante encontrado
            
        Raises:
            HTTPException: Si no se encuentra el participante
        """
        db = load_database()
        participante = next((p for p in db.participantes if p.id == participante_id), None)
        
        if not participante:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        return participante
    
    @staticmethod
    def create(participante_data: ParticipanteCreate, participante_id: str) -> Participante:
        """
        Crear un nuevo participante
        
        Args:
            participante_data (ParticipanteCreate): Datos del participante
            participante_id (str): ID único para el participante
            
        Returns:
            Participante: Participante creado
            
        Raises:
            HTTPException: Si ya existe un participante con ese ID
        """
        db = load_database()
        
        # Verificar que el ID no exista
        if any(p.id == participante_id for p in db.participantes):
            raise HTTPException(status_code=400, detail="Ya existe un participante con este ID")
        
        # Crear el participante
        participante = Participante(
            id=participante_id,
            **participante_data.model_dump()
        )
        
        db.participantes.append(participante)
        save_database(db)
        
        return participante
    
    @staticmethod
    def update(participante_id: str, participante_data: Participante) -> Participante:
        """
        Actualizar un participante existente
        
        Args:
            participante_id (str): ID del participante a actualizar
            participante_data (Participante): Nuevos datos del participante
            
        Returns:
            Participante: Participante actualizado
            
        Raises:
            HTTPException: Si no se encuentra el participante o hay conflicto de ID
        """
        db = load_database()
        
        # Buscar el participante
        participante_index = next((i for i, p in enumerate(db.participantes) if p.id == participante_id), None)
        if participante_index is None:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        # Verificar que el ID no cambie o que no exista otro con el nuevo ID
        if participante_data.id != participante_id:
            if any(p.id == participante_data.id for p in db.participantes):
                raise HTTPException(status_code=400, detail="Ya existe un participante con este ID")
        
        db.participantes[participante_index] = participante_data
        save_database(db)
        
        return participante_data
    
    @staticmethod
    def delete(participante_id: str) -> dict:
        """
        Eliminar un participante
        
        Args:
            participante_id (str): ID del participante a eliminar
            
        Returns:
            dict: Mensaje de confirmación
            
        Raises:
            HTTPException: Si no se encuentra el participante o tiene gastos asociados
        """
        db = load_database()
        
        # Buscar el participante
        participante_index = next((i for i, p in enumerate(db.participantes) if p.id == participante_id), None)
        if participante_index is None:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        # Verificar que no esté involucrado en gastos
        gastos_con_participante = [
            g for g in db.gastos 
            if participante_id in g.participantes or g.pagado_por == participante_id
        ]
        if gastos_con_participante:
            raise HTTPException(
                status_code=400, 
                detail="No se puede eliminar un participante que tiene gastos asociados"
            )
        
        db.participantes.pop(participante_index)
        save_database(db)
        
        return {"message": "Participante eliminado correctamente"}
    
    @staticmethod
    def exists(participante_id: str) -> bool:
        """
        Verificar si un participante existe
        
        Args:
            participante_id (str): ID del participante
            
        Returns:
            bool: True si existe, False si no
        """
        db = load_database()
        return any(p.id == participante_id for p in db.participantes)
