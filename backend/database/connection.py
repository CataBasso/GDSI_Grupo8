"""
Módulo de conexión y manejo de la base de datos JSON
"""
import json
import os
from typing import Optional
from models.schemas import Database


# Ruta del archivo JSON
DATABASE_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "database.json"))


def load_database() -> Database:
    """
    Cargar datos desde el archivo JSON
    
    Returns:
        Database: Instancia de la base de datos cargada
    """
    try:
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return Database(**data)
        else:
            return Database()
    except Exception as e:
        print(f"Error cargando base de datos: {e}")
        return Database()


def save_database(db: Database) -> None:
    """
    Guardar datos en el archivo JSON
    
    Args:
        db (Database): Instancia de la base de datos a guardar
        
    Raises:
        Exception: Si hay error al guardar los datos
    """
    try:
        os.makedirs(os.path.dirname(DATABASE_FILE), exist_ok=True)
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(db.model_dump(), f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error guardando base de datos: {e}")
        raise Exception("Error guardando datos")


def get_database_file_path() -> str:
    """
    Obtener la ruta del archivo de base de datos
    
    Returns:
        str: Ruta absoluta del archivo de base de datos
    """
    return DATABASE_FILE


def database_exists() -> bool:
    """
    Verificar si el archivo de base de datos existe
    
    Returns:
        bool: True si existe, False si no
    """
    return os.path.exists(DATABASE_FILE)
