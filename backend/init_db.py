#!/usr/bin/env python3
"""
Script para inicializar la base de datos con datos por defecto
"""
import json
import os
import requests

def init_database():
    """Inicializar la base de datos con datos por defecto"""
    
    # Datos por defecto
    data = {
        "participantes": [
            {
                "id": "1",
                "nombre": "María González",
                "email": "maria@email.com",
                "telefono": "+54 11 1234-5678",
                "unidad": "2A",
                "activo": True
            },
            {
                "id": "2",
                "nombre": "Carlos Rodriguez",
                "email": "carlos@email.com",
                "telefono": "+54 11 9876-5432",
                "unidad": "1B",
                "activo": True
            },
            {
                "id": "3",
                "nombre": "Ana Martínez",
                "email": "ana@email.com",
                "telefono": "+54 11 5555-1234",
                "unidad": "4D",
                "activo": True
            },
            {
                "id": "4",
                "nombre": "Juan Pérez",
                "email": "juan@email.com",
                "telefono": "+54 11 7777-8888",
                "unidad": "3C",
                "activo": True
            }
        ],
        "gastos": [],
        "pagos": [],
        "usuarioActual": {
            "id": "1",
            "nombre": "María González",
            "email": "maria@email.com",
            "unidad": "2A"
        }
    }
    
    # Ruta del archivo
    db_file = os.path.join(os.path.dirname(__file__), "data", "database.json")
    
    print(f"Inicializando base de datos en: {db_file}")
    
    # Crear directorio si no existe
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    
    # Escribir archivo
    with open(db_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Base de datos inicializada correctamente")
    print(f"Participantes creados: {len(data['participantes'])}")
    
    # Verificar que el servidor esté funcionando
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            print("Servidor backend está funcionando")
            
            # Probar endpoint de participantes
            response = requests.get('http://localhost:8000/participantes')
            if response.status_code == 200:
                participantes = response.json()
                print(f"Endpoint /participantes devuelve: {len(participantes)} participantes")
            else:
                print(f"Error en endpoint /participantes: {response.status_code}")
        else:
            print("Servidor backend no está funcionando")
    except Exception as e:
        print(f"Error verificando servidor: {e}")

if __name__ == "__main__":
    init_database()
