from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="GDSI Backend API", version="1.0.0")

# Configurar CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta del archivo JSON
DATABASE_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "database.json"))

# Modelos Pydantic
class Participante(BaseModel):
    id: str
    nombre: str
    email: str
    telefono: str
    unidad: str
    activo: bool = True

class Gasto(BaseModel):
    id: str
    descripcion: str
    monto: float
    fecha: str
    categoria: str
    pagado_por: str  # ID del participante
    participantes: List[str]  # Lista de IDs de participantes que deben pagar
    creado_por: str  # ID del usuario que creó el gasto

class Pago(BaseModel):
    id: str
    descripcion: str
    monto: float
    fecha: str
    deudor_id: str  # ID del participante que paga
    acreedor_id: str  # ID del participante que recibe
    comprobante: str  # Comprobante del pago
    creado_por: str  # ID del usuario que creó el pago

class UsuarioActual(BaseModel):
    id: str
    nombre: str
    email: str
    unidad: str

class Database(BaseModel):
    gastos: List[Gasto] = []
    pagos: List[Pago] = []
    participantes: List[Participante] = []
    usuarioActual: Optional[UsuarioActual] = None

# Funciones de utilidad para manejar el JSON
def load_database() -> Database:
    """Cargar datos desde el archivo JSON"""
    try:
        print(f"Intentando cargar desde: {DATABASE_FILE}")
        print(f"Archivo existe: {os.path.exists(DATABASE_FILE)}")
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Datos leídos: {len(data.get('participantes', []))} participantes")
                return Database(**data)
        else:
            print("Archivo no existe, retornando base de datos vacía")
            return Database()
    except Exception as e:
        print(f"Error cargando base de datos: {e}")
        import traceback
        traceback.print_exc()
        return Database()

def save_database(db: Database):
    """Guardar datos en el archivo JSON"""
    try:
        os.makedirs(os.path.dirname(DATABASE_FILE), exist_ok=True)
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(db.dict(), f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error guardando base de datos: {e}")
        raise HTTPException(status_code=500, detail="Error guardando datos")

# Endpoints para Participantes
@app.get("/participantes", response_model=List[Participante])
async def get_participantes():
    """Obtener todos los participantes"""
    db = load_database()
    return db.participantes

@app.post("/participantes", response_model=Participante)
async def create_participante(participante: Participante):
    """Crear un nuevo participante"""
    db = load_database()
    
    # Verificar que el ID no exista
    if any(p.id == participante.id for p in db.participantes):
        raise HTTPException(status_code=400, detail="Ya existe un participante con este ID")
    
    db.participantes.append(participante)
    save_database(db)
    return participante

@app.get("/participantes/{participante_id}", response_model=Participante)
async def get_participante(participante_id: str):
    """Obtener un participante por ID"""
    db = load_database()
    participante = next((p for p in db.participantes if p.id == participante_id), None)
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no encontrado")
    return participante

@app.put("/participantes/{participante_id}", response_model=Participante)
async def update_participante(participante_id: str, participante: Participante):
    """Actualizar un participante"""
    db = load_database()
    
    # Verificar que el participante existe
    participante_index = next((i for i, p in enumerate(db.participantes) if p.id == participante_id), None)
    if participante_index is None:
        raise HTTPException(status_code=404, detail="Participante no encontrado")
    
    # Verificar que el ID no cambie o que no exista otro con el nuevo ID
    if participante.id != participante_id:
        if any(p.id == participante.id for p in db.participantes):
            raise HTTPException(status_code=400, detail="Ya existe un participante con este ID")
    
    db.participantes[participante_index] = participante
    save_database(db)
    return participante

@app.delete("/participantes/{participante_id}")
async def delete_participante(participante_id: str):
    """Eliminar un participante"""
    db = load_database()
    
    participante_index = next((i for i, p in enumerate(db.participantes) if p.id == participante_id), None)
    if participante_index is None:
        raise HTTPException(status_code=404, detail="Participante no encontrado")
    
    # Verificar que no esté involucrado en gastos
    gastos_con_participante = [g for g in db.gastos if participante_id in g.participantes or g.pagado_por == participante_id]
    if gastos_con_participante:
        raise HTTPException(status_code=400, detail="No se puede eliminar un participante que tiene gastos asociados")
    
    db.participantes.pop(participante_index)
    save_database(db)
    return {"message": "Participante eliminado correctamente"}

# Endpoints para Gastos
@app.get("/gastos", response_model=List[Gasto])
async def get_gastos():
    """Obtener todos los gastos"""
    db = load_database()
    return db.gastos

@app.post("/gastos", response_model=Gasto)
async def create_gasto(gasto: Gasto):
    """Crear un nuevo gasto"""
    db = load_database()
    
    # Verificar que el ID no exista
    if any(g.id == gasto.id for g in db.gastos):
        raise HTTPException(status_code=400, detail="Ya existe un gasto con este ID")
    
    # Verificar que los participantes existan
    participante_ids = [p.id for p in db.participantes]
    if gasto.pagado_por not in participante_ids:
        raise HTTPException(status_code=400, detail="El participante que pagó no existe")
    
    for participante_id in gasto.participantes:
        if participante_id not in participante_ids:
            raise HTTPException(status_code=400, detail=f"El participante {participante_id} no existe")
    
    db.gastos.append(gasto)
    save_database(db)
    return gasto

@app.get("/gastos/{gasto_id}", response_model=Gasto)
async def get_gasto(gasto_id: str):
    """Obtener un gasto por ID"""
    db = load_database()
    gasto = next((g for g in db.gastos if g.id == gasto_id), None)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto

@app.put("/gastos/{gasto_id}", response_model=Gasto)
async def update_gasto(gasto_id: str, gasto: Gasto):
    """Actualizar un gasto"""
    db = load_database()
    
    # Verificar que el gasto existe
    gasto_index = next((i for i, g in enumerate(db.gastos) if g.id == gasto_id), None)
    if gasto_index is None:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    
    # Verificar que el ID no cambie o que no exista otro con el nuevo ID
    if gasto.id != gasto_id:
        if any(g.id == gasto.id for g in db.gastos):
            raise HTTPException(status_code=400, detail="Ya existe un gasto con este ID")
    
    # Verificar que los participantes existan
    participante_ids = [p.id for p in db.participantes]
    if gasto.pagado_por not in participante_ids:
        raise HTTPException(status_code=400, detail="El participante que pagó no existe")
    
    for participante_id in gasto.participantes:
        if participante_id not in participante_ids:
            raise HTTPException(status_code=400, detail=f"El participante {participante_id} no existe")
    
    db.gastos[gasto_index] = gasto
    save_database(db)
    return gasto

@app.delete("/gastos/{gasto_id}")
async def delete_gasto(gasto_id: str):
    """Eliminar un gasto"""
    db = load_database()
    
    gasto_index = next((i for i, g in enumerate(db.gastos) if g.id == gasto_id), None)
    if gasto_index is None:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    
    db.gastos.pop(gasto_index)
    save_database(db)
    return {"message": "Gasto eliminado correctamente"}

# Endpoints para Pagos
@app.get("/pagos", response_model=List[Pago])
async def get_pagos():
    """Obtener todos los pagos"""
    db = load_database()
    return db.pagos

@app.get("/pagos/{pago_id}", response_model=Pago)
async def get_pago(pago_id: str):
    """Obtener un pago por ID"""
    db = load_database()
    pago = next((p for p in db.pagos if p.id == pago_id), None)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return pago

@app.post("/pagos", response_model=Pago)
async def create_pago(pago: Pago):
    """Crear un nuevo pago"""
    db = load_database()
    
    # Verificar que no exista un pago con el mismo ID
    if any(p.id == pago.id for p in db.pagos):
        raise HTTPException(status_code=400, detail="Ya existe un pago con este ID")
    
    # Verificar que los participantes existan
    participante_ids = [p.id for p in db.participantes]
    if pago.deudor_id not in participante_ids:
        raise HTTPException(status_code=400, detail="El deudor no existe")
    if pago.acreedor_id not in participante_ids:
        raise HTTPException(status_code=400, detail="El acreedor no existe")
    
    db.pagos.append(pago)
    save_database(db)
    return pago

@app.put("/pagos/{pago_id}", response_model=Pago)
async def update_pago(pago_id: str, pago: Pago):
    """Actualizar un pago"""
    db = load_database()
    
    pago_index = next((i for i, p in enumerate(db.pagos) if p.id == pago_id), None)
    if pago_index is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    # Verificar que el ID no cambie o que no exista otro con el nuevo ID
    if pago.id != pago_id:
        if any(p.id == pago.id for p in db.pagos):
            raise HTTPException(status_code=400, detail="Ya existe un pago con este ID")
    
    # Verificar que los participantes existan
    participante_ids = [p.id for p in db.participantes]
    if pago.deudor_id not in participante_ids:
        raise HTTPException(status_code=400, detail="El deudor no existe")
    if pago.acreedor_id not in participante_ids:
        raise HTTPException(status_code=400, detail="El acreedor no existe")
    
    db.pagos[pago_index] = pago
    save_database(db)
    return pago

@app.delete("/pagos/{pago_id}")
async def delete_pago(pago_id: str):
    """Eliminar un pago"""
    db = load_database()
    
    pago_index = next((i for i, p in enumerate(db.pagos) if p.id == pago_id), None)
    if pago_index is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    db.pagos.pop(pago_index)
    save_database(db)
    return {"message": "Pago eliminado correctamente"}

# Endpoints para Usuario Actual
@app.get("/usuario-actual", response_model=UsuarioActual)
async def get_usuario_actual():
    """Obtener el usuario actual"""
    db = load_database()
    if not db.usuarioActual:
        raise HTTPException(status_code=404, detail="No hay usuario actual configurado")
    return db.usuarioActual

@app.put("/usuario-actual", response_model=UsuarioActual)
async def update_usuario_actual(usuario: UsuarioActual):
    """Actualizar el usuario actual"""
    db = load_database()
    
    # Verificar que el usuario existe en participantes
    participante = next((p for p in db.participantes if p.id == usuario.id), None)
    if not participante:
        raise HTTPException(status_code=400, detail="El usuario debe existir en la lista de participantes")
    
    db.usuarioActual = usuario
    save_database(db)
    return usuario


# Endpoint de salud
@app.get("/health")
async def health_check():
    """Verificar que el servidor esté funcionando"""
    return {"status": "ok", "message": "Servidor funcionando correctamente"}

# Endpoint de prueba para verificar la carga de datos
@app.get("/test-db")
async def test_database():
    """Endpoint de prueba para verificar la carga de datos"""
    try:
        print(f"=== Test DB endpoint ===")
        print(f"Archivo: {DATABASE_FILE}")
        print(f"Existe: {os.path.exists(DATABASE_FILE)}")
        
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Datos leídos: {len(data.get('participantes', []))} participantes")
                return {
                    "status": "ok",
                    "file_path": DATABASE_FILE,
                    "file_exists": True,
                    "participantes_count": len(data.get('participantes', [])),
                    "gastos_count": len(data.get('gastos', [])),
                    "data": data
                }
        else:
            return {
                "status": "error",
                "file_path": DATABASE_FILE,
                "file_exists": False,
                "message": "Archivo no encontrado"
            }
    except Exception as e:
        print(f"Error en test-db: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
