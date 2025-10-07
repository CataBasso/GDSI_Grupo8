#!/usr/bin/env python3
"""
Script para migrar datos existentes del frontend al backend
"""
import json
import os
import shutil
from datetime import datetime

def migrate_data():
    """Migrar datos del archivo JSON del frontend al backend"""
    
    # Ruta del archivo original
    original_file = "../public/data/database.json"
    # Ruta del archivo de destino en el backend
    backend_file = "data/database.json"
    
    try:
        # Leer el archivo original
        with open(original_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Crear directorio de datos si no existe
        os.makedirs(os.path.dirname(backend_file), exist_ok=True)
        
        # Copiar el archivo al backend
        shutil.copy2(original_file, backend_file)
        
        print("Datos migrados exitosamente!")
        print(f"Archivo copiado de: {original_file}")
        print(f"Archivo copiado a: {backend_file}")
        
        # Mostrar resumen de datos
        print("\nResumen de datos migrados:")
        print(f"   Participantes: {len(data.get('participantes', []))}")
        print(f"   Gastos: {len(data.get('gastos', []))}")
        print(f"   Usuario actual: {'Si' if data.get('usuarioActual') else 'No'}")
        
        return True
        
    except FileNotFoundError:
        print(f"Error: No se encontro el archivo {original_file}")
        print("   Asegurate de que el archivo existe en la ruta correcta")
        return False
    except Exception as e:
        print(f"Error durante la migracion: {e}")
        return False

if __name__ == "__main__":
    print("Iniciando migracion de datos...")
    success = migrate_data()
    
    if success:
        print("\nMigracion completada! Ahora puedes ejecutar el backend con:")
        print("   python run.py")
    else:
        print("\nLa migracion fallo. Revisa los errores anteriores.")
