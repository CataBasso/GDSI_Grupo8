"""
Rutas para la gestión de pagos
"""
from typing import List
from fastapi import APIRouter
from models.schemas import Pago, PagoCreate
from services.pago_service import PagoService
from utils.helpers import generate_id

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.get("/", response_model=List[Pago])
async def get_pagos():
    """Obtener todos los pagos"""
    return PagoService.get_all()


@router.post("/", response_model=Pago)
async def create_pago(pago: PagoCreate):
    """Crear un nuevo pago"""
    pago_id = generate_id()
    return PagoService.create(pago, pago_id)


@router.get("/{pago_id}", response_model=Pago)
async def get_pago(pago_id: str):
    """Obtener un pago por ID"""
    return PagoService.get_by_id(pago_id)


@router.put("/{pago_id}", response_model=Pago)
async def update_pago(pago_id: str, pago: Pago):
    """Actualizar un pago"""
    return PagoService.update(pago_id, pago)


@router.delete("/{pago_id}")
async def delete_pago(pago_id: str):
    """Eliminar un pago"""
    return PagoService.delete(pago_id)
