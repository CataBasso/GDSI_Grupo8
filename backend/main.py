"""
MiConsorcio Backend API
Punto de entrada principal de la aplicación FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar rutas
from routes.participantes import router as participantes_router
from routes.gastos import router as gastos_router
from routes.pagos import router as pagos_router
from routes.usuario import router as usuario_router
from routes.health import router as health_router

# Crear aplicación FastAPI
app = FastAPI(
    title="MiConsorcio API",
    description="API REST para gestión de gastos compartidos en consorcios",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(participantes_router)
app.include_router(gastos_router)
app.include_router(pagos_router)
app.include_router(usuario_router)
app.include_router(health_router)


@app.get("/")
async def root():
    """Endpoint raíz con información básica de la API"""
    return {
        "message": "MiConsorcio API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
