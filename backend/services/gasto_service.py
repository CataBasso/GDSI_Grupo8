"""
Servicio para la lógica de negocio de gastos
"""
from typing import List
from models.schemas import Gasto, GastoCreate
from database.connection import load_database, save_database
from services.participante_service import ParticipanteService
from fastapi import HTTPException


class GastoService:
    """Servicio para gestionar gastos"""
    
    @staticmethod
    def get_all() -> List[Gasto]:
        """
        Obtener todos los gastos
        
        Returns:
            List[Gasto]: Lista de todos los gastos
        """
        db = load_database()
        return db.gastos
    
    @staticmethod
    def get_by_id(gasto_id: str) -> Gasto:
        """
        Obtener un gasto por ID
        
        Args:
            gasto_id (str): ID del gasto
            
        Returns:
            Gasto: Gasto encontrado
            
        Raises:
            HTTPException: Si no se encuentra el gasto
        """
        db = load_database()
        gasto = next((g for g in db.gastos if g.id == gasto_id), None)
        
        if not gasto:
            raise HTTPException(status_code=404, detail="Gasto no encontrado")
        
        return gasto
    
    @staticmethod
    def create(gasto_data: GastoCreate, gasto_id: str) -> Gasto:
        """
        Crear un nuevo gasto
        
        Args:
            gasto_data (GastoCreate): Datos del gasto
            gasto_id (str): ID único para el gasto
            
        Returns:
            Gasto: Gasto creado
            
        Raises:
            HTTPException: Si ya existe un gasto con ese ID o participantes no existen
        """
        db = load_database()
        
        # Verificar que el ID no exista
        if any(g.id == gasto_id for g in db.gastos):
            raise HTTPException(status_code=400, detail="Ya existe un gasto con este ID")
        
        # Verificar que los participantes existan
        if not ParticipanteService.exists(gasto_data.pagado_por):
            raise HTTPException(status_code=400, detail="El participante que pagó no existe")
        
        for participante_id in gasto_data.participantes:
            if not ParticipanteService.exists(participante_id):
                raise HTTPException(
                    status_code=400, 
                    detail=f"El participante {participante_id} no existe"
                )
        
        # Crear el gasto
        gasto = Gasto(
            id=gasto_id,
            **gasto_data.model_dump()
        )
        
        db.gastos.append(gasto)
        save_database(db)
        
        return gasto
    
    @staticmethod
    def update(gasto_id: str, gasto_data: Gasto) -> Gasto:
        """
        Actualizar un gasto existente
        
        Args:
            gasto_id (str): ID del gasto a actualizar
            gasto_data (Gasto): Nuevos datos del gasto
            
        Returns:
            Gasto: Gasto actualizado
            
        Raises:
            HTTPException: Si no se encuentra el gasto o hay conflicto de ID
        """
        db = load_database()
        
        # Buscar el gasto
        gasto_index = next((i for i, g in enumerate(db.gastos) if g.id == gasto_id), None)
        if gasto_index is None:
            raise HTTPException(status_code=404, detail="Gasto no encontrado")
        
        # Verificar que el ID no cambie o que no exista otro con el nuevo ID
        if gasto_data.id != gasto_id:
            if any(g.id == gasto_data.id for g in db.gastos):
                raise HTTPException(status_code=400, detail="Ya existe un gasto con este ID")
        
        # Verificar que los participantes existan
        if not ParticipanteService.exists(gasto_data.pagado_por):
            raise HTTPException(status_code=400, detail="El participante que pagó no existe")
        
        for participante_id in gasto_data.participantes:
            if not ParticipanteService.exists(participante_id):
                raise HTTPException(
                    status_code=400, 
                    detail=f"El participante {participante_id} no existe"
                )
        
        db.gastos[gasto_index] = gasto_data
        save_database(db)
        
        return gasto_data
    
    @staticmethod
    def delete(gasto_id: str) -> dict:
        """
        Eliminar un gasto
        
        Args:
            gasto_id (str): ID del gasto a eliminar
            
        Returns:
            dict: Mensaje de confirmación
            
        Raises:
            HTTPException: Si no se encuentra el gasto
        """
        db = load_database()
        
        # Buscar el gasto
        gasto_index = next((i for i, g in enumerate(db.gastos) if g.id == gasto_id), None)
        if gasto_index is None:
            raise HTTPException(status_code=404, detail="Gasto no encontrado")
        
        db.gastos.pop(gasto_index)
        save_database(db)
        
        return {"message": "Gasto eliminado correctamente"}
    
    @staticmethod
    def get_by_participante(participante_id: str) -> List[Gasto]:
        """
        Obtener gastos relacionados con un participante
        
        Args:
            participante_id (str): ID del participante
            
        Returns:
            List[Gasto]: Lista de gastos relacionados
        """
        db = load_database()
        return [
            g for g in db.gastos 
            if participante_id in g.participantes or g.pagado_por == participante_id
        ]
