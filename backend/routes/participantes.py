"""
Rutas para la gestión de participantes
"""
from typing import List
from fastapi import APIRouter
from models.schemas import Participante, ParticipanteCreate
from services.participante_service import ParticipanteService
from utils.helpers import generate_id

router = APIRouter(prefix="/participantes", tags=["participantes"])


@router.get("/", response_model=List[Participante])
async def get_participantes():
    """Obtener todos los participantes"""
    return ParticipanteService.get_all()


@router.post("/", response_model=Participante)
async def create_participante(participante: ParticipanteCreate):
    """Crear un nuevo participante"""
    participante_id = generate_id()
    return ParticipanteService.create(participante, participante_id)


@router.get("/{participante_id}", response_model=Participante)
async def get_participante(participante_id: str):
    """Obtener un participante por ID"""
    return ParticipanteService.get_by_id(participante_id)


@router.put("/{participante_id}", response_model=Participante)
async def update_participante(participante_id: str, participante: Participante):
    """Actualizar un participante"""
    return ParticipanteService.update(participante_id, participante)


@router.delete("/{participante_id}")
async def delete_participante(participante_id: str):
    """Eliminar un participante"""
    return ParticipanteService.delete(participante_id)
