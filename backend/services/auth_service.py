"""
Servicio para la autenticación de usuarios
"""
import bcrypt
from typing import Optional
from datetime import datetime
from fastapi import HTTPException
from models.schemas import Usuario, LoginRequest, LoginResponse
from database.connection import load_database, save_database
from services.participante_service import ParticipanteService


class AuthService:
    """Servicio para gestionar autenticación"""

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """
        Verificar contraseña contra hash

        Args:
            password (str): Contraseña en texto plano
            hashed (str): Hash almacenado

        Returns:
            bool: True si la contraseña es correcta
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    @staticmethod
    def login(login_data: LoginRequest) -> LoginResponse:
        """
        Autenticar usuario

        Args:
            login_data (LoginRequest): Datos de login

        Returns:
            LoginResponse: Respuesta de login
        """
        db = load_database()

        # Buscar usuario por email
        usuario = next((u for u in db.usuarios if u.email == login_data.email), None)

        if not usuario:
            return LoginResponse(
                success=False,
                message="Usuario no encontrado"
            )

        # Verificar si el usuario está activo
        if not usuario.activo:
            return LoginResponse(
                success=False,
                message="Usuario desactivado"
            )

        # Verificar contraseña
        if not AuthService.verify_password(login_data.password, usuario.password_hash):
            return LoginResponse(
                success=False,
                message="Contraseña incorrecta"
            )

        # Obtener datos del participante
        try:
            participante = ParticipanteService.get_by_id(usuario.participante_id)
        except HTTPException:
            return LoginResponse(
                success=False,
                message="Error al obtener datos del participante"
            )

        # Buscar índice del usuario para actualizar
        usuario_index = next((i for i, u in enumerate(db.usuarios) if u.id == usuario.id), None)
        if usuario_index is not None:
            db.usuarios[usuario_index] = usuario
            save_database(db)

        return LoginResponse(
            success=True,
            message="Login exitoso",
            usuario={
                "id": participante.id,
                "nombre": participante.nombre,
                "email": participante.email,
                "unidad": participante.unidad
            }
        )