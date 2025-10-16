"""
Rutas para la gestión del usuario actual
"""
from fastapi import APIRouter
from models.schemas import UsuarioActual, UsuarioActualUpdate
from services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuario-actual", tags=["usuario"])


@router.get("/", response_model=UsuarioActual)
async def get_usuario_actual():
    """Obtener el usuario actual"""
    return UsuarioService.get_current()


@router.put("/", response_model=UsuarioActual)
async def update_usuario_actual(usuario: UsuarioActualUpdate):
    """Actualizar el usuario actual"""
    return UsuarioService.update(usuario)
