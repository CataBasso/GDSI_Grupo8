"""
Modelos Pydantic para la API de MiConsorcio
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional


class Participante(BaseModel):
    """Modelo para participantes del consorcio"""
    id: str
    nombre: str
    email: EmailStr
    telefono: str
    unidad: str
    activo: bool = True


class Gasto(BaseModel):
    """Modelo para gastos compartidos"""
    id: str
    descripcion: str
    monto: float
    fecha: str
    categoria: str
    comprobante: Optional[str] = None  # Comprobante del gasto
    pagado_por: str  # ID del participante
    participantes: List[str]  # Lista de IDs de participantes que deben pagar
    creado_por: str  # ID del usuario que creó el gasto


class Pago(BaseModel):
    """Modelo para pagos entre participantes"""
    id: str
    descripcion: str
    monto: float
    fecha: str
    deudor_id: str  # ID del participante que paga
    acreedor_id: str  # ID del participante que recibe
    comprobante: str  # Comprobante del pago
    creado_por: str  # ID del usuario que creó el pago


class UsuarioActual(BaseModel):
    """Modelo para el usuario actual logueado"""
    id: str
    nombre: str
    email: EmailStr
    unidad: str

class Usuario(BaseModel):
    """Modelo para usuarios del sistema"""
    id: str
    participante_id: str
    email: str
    password_hash: str
    activo: bool = True

class Database(BaseModel):
    """Modelo para la base de datos completa"""
    gastos: List[Gasto] = []
    pagos: List[Pago] = []
    participantes: List[Participante] = []
    usuarios: List[Usuario] = []
    usuarioActual: Optional[UsuarioActual] = None

# Modelos para requests de creación (sin ID)
class ParticipanteCreate(BaseModel):
    """Modelo para crear un nuevo participante"""
    nombre: str
    email: EmailStr
    telefono: str
    unidad: str
    activo: bool = True

class GastoCreate(BaseModel):
    """Modelo para crear un nuevo gasto"""
    descripcion: str
    monto: float
    fecha: str
    categoria: str
    comprobante: Optional[str] = None
    pagado_por: str
    participantes: List[str]
    creado_por: str

class PagoCreate(BaseModel):
    """Modelo para crear un nuevo pago"""
    descripcion: str
    monto: float
    fecha: str
    deudor_id: str
    acreedor_id: str
    comprobante: str
    creado_por: str

class UsuarioActualUpdate(BaseModel):
    """Modelo para actualizar el usuario actual"""
    id: str
    nombre: str
    email: EmailStr
    unidad: str

class LoginRequest(BaseModel):
    """Modelo para solicitud de login"""
    email: str
    password: str

class LoginResponse(BaseModel):
    """Modelo para respuesta de login"""
    success: bool
    message: str
    usuario: Optional[dict] = None
    token: Optional[str] = None