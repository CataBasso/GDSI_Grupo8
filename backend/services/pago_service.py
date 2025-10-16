"""
Servicio para la lógica de negocio de pagos
"""
from typing import List
from models.schemas import Pago, PagoCreate
from database.connection import load_database, save_database
from services.participante_service import ParticipanteService
from fastapi import HTTPException


class PagoService:
    """Servicio para gestionar pagos"""
    
    @staticmethod
    def get_all() -> List[Pago]:
        """
        Obtener todos los pagos
        
        Returns:
            List[Pago]: Lista de todos los pagos
        """
        db = load_database()
        return db.pagos
    
    @staticmethod
    def get_by_id(pago_id: str) -> Pago:
        """
        Obtener un pago por ID
        
        Args:
            pago_id (str): ID del pago
            
        Returns:
            Pago: Pago encontrado
            
        Raises:
            HTTPException: Si no se encuentra el pago
        """
        db = load_database()
        pago = next((p for p in db.pagos if p.id == pago_id), None)
        
        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        return pago
    
    @staticmethod
    def create(pago_data: PagoCreate, pago_id: str) -> Pago:
        """
        Crear un nuevo pago
        
        Args:
            pago_data (PagoCreate): Datos del pago
            pago_id (str): ID único para el pago
            
        Returns:
            Pago: Pago creado
            
        Raises:
            HTTPException: Si ya existe un pago con ese ID o participantes no existen
        """
        db = load_database()
        
        # Verificar que el ID no exista
        if any(p.id == pago_id for p in db.pagos):
            raise HTTPException(status_code=400, detail="Ya existe un pago con este ID")
        
        # Verificar que los participantes existan
        if not ParticipanteService.exists(pago_data.deudor_id):
            raise HTTPException(status_code=400, detail="El deudor no existe")
        
        if not ParticipanteService.exists(pago_data.acreedor_id):
            raise HTTPException(status_code=400, detail="El acreedor no existe")
        
        # Crear el pago
        pago = Pago(
            id=pago_id,
            **pago_data.model_dump()
        )
        
        db.pagos.append(pago)
        save_database(db)
        
        return pago
    
    @staticmethod
    def update(pago_id: str, pago_data: Pago) -> Pago:
        """
        Actualizar un pago existente
        
        Args:
            pago_id (str): ID del pago a actualizar
            pago_data (Pago): Nuevos datos del pago
            
        Returns:
            Pago: Pago actualizado
            
        Raises:
            HTTPException: Si no se encuentra el pago o hay conflicto de ID
        """
        db = load_database()
        
        # Buscar el pago
        pago_index = next((i for i, p in enumerate(db.pagos) if p.id == pago_id), None)
        if pago_index is None:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        # Verificar que el ID no cambie o que no exista otro con el nuevo ID
        if pago_data.id != pago_id:
            if any(p.id == pago_data.id for p in db.pagos):
                raise HTTPException(status_code=400, detail="Ya existe un pago con este ID")
        
        # Verificar que los participantes existan
        if not ParticipanteService.exists(pago_data.deudor_id):
            raise HTTPException(status_code=400, detail="El deudor no existe")
        
        if not ParticipanteService.exists(pago_data.acreedor_id):
            raise HTTPException(status_code=400, detail="El acreedor no existe")
        
        db.pagos[pago_index] = pago_data
        save_database(db)
        
        return pago_data
    
    @staticmethod
    def delete(pago_id: str) -> dict:
        """
        Eliminar un pago
        
        Args:
            pago_id (str): ID del pago a eliminar
            
        Returns:
            dict: Mensaje de confirmación
            
        Raises:
            HTTPException: Si no se encuentra el pago
        """
        db = load_database()
        
        # Buscar el pago
        pago_index = next((i for i, p in enumerate(db.pagos) if p.id == pago_id), None)
        if pago_index is None:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        db.pagos.pop(pago_index)
        save_database(db)
        
        return {"message": "Pago eliminado correctamente"}
    
    @staticmethod
    def get_by_participante(participante_id: str) -> List[Pago]:
        """
        Obtener pagos relacionados con un participante
        
        Args:
            participante_id (str): ID del participante
            
        Returns:
            List[Pago]: Lista de pagos relacionados
        """
        db = load_database()
        return [
            p for p in db.pagos 
            if p.deudor_id == participante_id or p.acreedor_id == participante_id
        ]
