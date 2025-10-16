"""
Rutas para autenticación
"""
from fastapi import APIRouter
from models.schemas import LoginRequest, LoginResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["autenticación"])

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Autenticar usuario"""
    return AuthService.login(login_data)
