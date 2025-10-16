"""
Rutas para la gestión de gastos
"""
from typing import List
from fastapi import APIRouter
from models.schemas import Gasto, GastoCreate
from services.gasto_service import GastoService
from utils.helpers import generate_id

router = APIRouter(prefix="/gastos", tags=["gastos"])


@router.get("/", response_model=List[Gasto])
async def get_gastos():
    """Obtener todos los gastos"""
    return GastoService.get_all()


@router.post("/", response_model=Gasto)
async def create_gasto(gasto: GastoCreate):
    """Crear un nuevo gasto"""
    gasto_id = generate_id()
    return GastoService.create(gasto, gasto_id)


@router.get("/{gasto_id}", response_model=Gasto)
async def get_gasto(gasto_id: str):
    """Obtener un gasto por ID"""
    return GastoService.get_by_id(gasto_id)


@router.put("/{gasto_id}", response_model=Gasto)
async def update_gasto(gasto_id: str, gasto: Gasto):
    """Actualizar un gasto"""
    return GastoService.update(gasto_id, gasto)


@router.delete("/{gasto_id}")
async def delete_gasto(gasto_id: str):
    """Eliminar un gasto"""
    return GastoService.delete(gasto_id)
