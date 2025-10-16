#!/usr/bin/env python3
"""
Script para probar la funcionalidad de la base de datos
"""
import sys
import os
sys.path.append('.')

from main import load_database, save_database, Database

def test_database():
    print("=== Prueba de Base de Datos ===")
    
    # Cargar base de datos
    print("1. Cargando base de datos...")
    db = load_database()
    print(f"   Participantes: {len(db.participantes)}")
    print(f"   Gastos: {len(db.gastos)}")
    print(f"   Pagos: {len(db.pagos)}")
    print(f"   Usuario actual: {db.usuarioActual}")
    
    # Si no hay datos, crear algunos
    if not db.participantes:
        print("2. Base de datos vacía, creando datos de prueba...")
        from main import Participante, UsuarioActual
        
        # Crear participantes
        participantes = [
            Participante(
                id="1",
                nombre="María González",
                email="maria@email.com",
                telefono="+54 11 1234-5678",
                unidad="2A",
                activo=True
            ),
            Participante(
                id="2",
                nombre="Carlos Rodriguez",
                email="carlos@email.com",
                telefono="+54 11 9876-5432",
                unidad="1B",
                activo=True
            ),
            Participante(
                id="3",
                nombre="Ana Martínez",
                email="ana@email.com",
                telefono="+54 11 5555-1234",
                unidad="4D",
                activo=True
            ),
            Participante(
                id="4",
                nombre="Juan Pérez",
                email="juan@email.com",
                telefono="+54 11 7777-8888",
                unidad="3C",
                activo=True
            )
        ]
        
        # Crear usuario actual
        usuario_actual = UsuarioActual(
            id="1",
            nombre="María González",
            email="maria@email.com",
            unidad="2A"
        )
        
        # Crear nueva base de datos
        db = Database(
            participantes=participantes,
            gastos=[],
            pagos=[],
            usuarioActual=usuario_actual
        )
        
        # Guardar base de datos
        save_database(db)
        print("   Datos creados y guardados correctamente")
    else:
        print("2. Base de datos ya tiene datos")
    
    # Recargar para verificar
    print("3. Recargando base de datos...")
    db_reloaded = load_database()
    print(f"   Participantes: {len(db_reloaded.participantes)}")
    print(f"   Gastos: {len(db_reloaded.gastos)}")
    print(f"   Pagos: {len(db_reloaded.pagos)}")
    print(f"   Usuario actual: {db_reloaded.usuarioActual}")
    
    print("=== Prueba completada ===")

if __name__ == "__main__":
    test_database()
