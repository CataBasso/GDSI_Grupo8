"""
Rutas para utilidades y estado del sistema
"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Verificar que el servidor esté funcionando"""
    return {"status": "ok", "message": "Servidor funcionando correctamente"}
