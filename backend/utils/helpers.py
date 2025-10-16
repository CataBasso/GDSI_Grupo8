"""
Utilidades y funciones helper
"""
import random
import string
from datetime import datetime


def generate_id() -> str:
    """
    Generar un ID único para entidades
    
    Returns:
        str: ID único generado
    """
    timestamp = int(datetime.now().timestamp() * 1000)
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"{timestamp}{random_suffix}"


def format_currency(amount: float) -> str:
    """
    Formatear un monto como moneda argentina
    
    Args:
        amount (float): Monto a formatear
        
    Returns:
        str: Monto formateado
    """
    return f"${amount:,.2f}".replace(",", ".")


def validate_email_format(email: str) -> bool:
    """
    Validar formato básico de email
    
    Args:
        email (str): Email a validar
        
    Returns:
        bool: True si el formato es válido
    """
    return "@" in email and "." in email.split("@")[-1]


def get_current_date() -> str:
    """
    Obtener la fecha actual en formato YYYY-MM-DD
    
    Returns:
        str: Fecha actual formateada
    """
    return datetime.now().strftime("%Y-%m-%d")
