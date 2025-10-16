# 🔧 MiConsorcio Backend API

API REST desarrollada con FastAPI para gestionar gastos compartidos y participantes del sistema MiConsorcio.

## 🚀 Inicio Rápido

### Instalación
```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python run.py
```

El servidor estará disponible en `http://localhost:8000`

### Documentación Interactiva
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Arquitectura

### Tecnologías
- **FastAPI** - Framework web moderno y rápido
- **Pydantic** - Validación de datos y serialización
- **Uvicorn** - Servidor ASGI de alto rendimiento
- **JSON** - Persistencia de datos (archivo local)

### Características
- ✅ **CRUD completo** para todas las entidades
- ✅ **Validación automática** con Pydantic
- ✅ **Documentación automática** con OpenAPI/Swagger
- ✅ **CORS configurado** para desarrollo frontend
- ✅ **Manejo de errores** robusto
- ✅ **Tipado estático** con Python type hints

## 📊 Modelos de Datos

### Participante
```python
{
  "id": "string",           # ID único del participante
  "nombre": "string",       # Nombre completo
  "email": "string",        # Email de contacto
  "telefono": "string",     # Teléfono de contacto
  "unidad": "string",       # Unidad del consorcio (ej: "2A", "1B")
  "activo": boolean         # Estado activo/inactivo
}
```

### Gasto
```python
{
  "id": "string",           # ID único del gasto
  "descripcion": "string",  # Descripción del gasto
  "monto": number,          # Monto en pesos
  "fecha": "string",        # Fecha en formato YYYY-MM-DD
  "categoria": "string",    # Categoría (mantenimiento, jardinería, etc.)
  "pagado_por": "string",   # ID del participante que pagó
  "participantes": ["string"], # IDs de participantes que deben aportar
  "creado_por": "string"    # ID del usuario que creó el gasto
}
```

### Pago
```python
{
  "id": "string",           # ID único del pago
  "descripcion": "string",  # Descripción del pago
  "monto": number,          # Monto pagado
  "fecha": "string",        # Fecha en formato YYYY-MM-DD
  "deudor_id": "string",    # ID del participante que paga
  "acreedor_id": "string",  # ID del participante que recibe
  "comprobante": "string",  # Comprobante del pago
  "creado_por": "string"    # ID del usuario que registró el pago
}
```

### Usuario Actual
```python
{
  "id": "string",           # ID del usuario actual
  "nombre": "string",       # Nombre del usuario
  "email": "string",        # Email del usuario
  "unidad": "string"        # Unidad del usuario
}
```

## 🔗 Endpoints Disponibles

### 👥 Participantes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/participantes` | Listar todos los participantes |
| `POST` | `/participantes` | Crear nuevo participante |
| `GET` | `/participantes/{id}` | Obtener participante por ID |
| `PUT` | `/participantes/{id}` | Actualizar participante |
| `DELETE` | `/participantes/{id}` | Eliminar participante |

### 💰 Gastos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/gastos` | Listar todos los gastos |
| `POST` | `/gastos` | Crear nuevo gasto |
| `GET` | `/gastos/{id}` | Obtener gasto por ID |
| `PUT` | `/gastos/{id}` | Actualizar gasto |
| `DELETE` | `/gastos/{id}` | Eliminar gasto |

### 💳 Pagos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/pagos` | Listar todos los pagos |
| `POST` | `/pagos` | Crear nuevo pago |
| `GET` | `/pagos/{id}` | Obtener pago por ID |
| `PUT` | `/pagos/{id}` | Actualizar pago |
| `DELETE` | `/pagos/{id}` | Eliminar pago |

### 👤 Usuario Actual
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/usuario-actual` | Obtener usuario actual |
| `PUT` | `/usuario-actual` | Actualizar usuario actual |

### 🔧 Utilidades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor |

## 💾 Persistencia de Datos

### Archivo JSON
Los datos se almacenan en `data/database.json` con la siguiente estructura:

```json
{
  "participantes": [...],
  "gastos": [...],
  "pagos": [...],
  "usuarioActual": {...}
}
```

### Características
- ✅ **Persistencia automática** en cada operación de escritura
- ✅ **Backup automático** del archivo antes de modificaciones
- ✅ **Validación de integridad** antes de guardar
- ✅ **Manejo de errores** en operaciones de I/O

## 🛠️ Desarrollo

### Estructura del Código
```
backend/
├── main.py              # Aplicación principal FastAPI
├── run.py               # Script de ejecución
├── requirements.txt     # Dependencias Python
├── data/
│   └── database.json    # Base de datos JSON
└── README.md            # Este archivo
```

### Funciones Principales

#### `load_database() -> Database`
Carga los datos desde el archivo JSON y retorna un objeto Database.

#### `save_database(db: Database)`
Guarda los datos en el archivo JSON con validación.

### Ejecución en Desarrollo
```bash
# Con recarga automática
python run.py

# O directamente con uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Logs y Debugging
- Los logs se muestran en consola
- Errores se capturan y retornan como HTTP 500
- Validación de datos con mensajes descriptivos

## 🔒 Validaciones y Seguridad

### Validaciones Automáticas
- ✅ **Tipos de datos** validados con Pydantic
- ✅ **Campos requeridos** verificados
- ✅ **Formato de email** validado
- ✅ **IDs únicos** verificados
- ✅ **Referencias** entre entidades validadas

### CORS
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📈 Rendimiento

### Optimizaciones
- ✅ **Validación rápida** con Pydantic
- ✅ **Serialización eficiente** JSON
- ✅ **Manejo asíncrono** con FastAPI
- ✅ **Carga lazy** de datos

### Límites
- **Archivo JSON**: Máximo ~10MB (limitado por memoria)
- **Concurrencia**: Limitada por acceso al archivo
- **Escalabilidad**: Para producción usar base de datos real

## 🚀 Despliegue

### Desarrollo
```bash
python run.py
```

### Producción
```bash
# Con gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# O con uvicorn directamente
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Variables de Entorno
```bash
export DATABASE_URL="postgresql://user:pass@localhost/db"
export SECRET_KEY="your-secret-key"
export DEBUG=False
```

## 🧪 Testing

### Pruebas Manuales
```bash
# Health check
curl http://localhost:8000/health

# Listar participantes
curl http://localhost:8000/participantes

# Crear participante
curl -X POST http://localhost:8000/participantes \
  -H "Content-Type: application/json" \
  -d '{"id":"test","nombre":"Test","email":"test@test.com","telefono":"123","unidad":"1A","activo":true}'
```

### Documentación Interactiva
Usar Swagger UI en http://localhost:8000/docs para pruebas interactivas.

## 📝 Dependencias

### Producción
- `fastapi==0.104.1` - Framework web
- `uvicorn[standard]==0.24.0` - Servidor ASGI
- `pydantic==2.5.0` - Validación de datos
- `python-multipart==0.0.6` - Manejo de formularios

### Desarrollo
- `pytest` - Testing framework
- `httpx` - Cliente HTTP para testing
- `black` - Formateador de código
- `flake8` - Linter de código

## 🆘 Troubleshooting

### Problemas Comunes

**Error: "No module named 'fastapi'"**
```bash
pip install -r requirements.txt
```

**Error: "Port 8000 already in use"**
```bash
# Cambiar puerto en run.py o matar proceso
lsof -ti:8000 | xargs kill -9
```

**Error: "Permission denied" al escribir archivo**
```bash
# Verificar permisos del directorio data/
chmod 755 data/
```

### Logs Útiles
```bash
# Ver logs detallados
uvicorn main:app --reload --log-level debug
```

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades:
1. Verificar que el servidor esté ejecutándose
2. Revisar logs en consola
3. Probar endpoints en Swagger UI
4. Crear issue en el repositorio

---

**Desarrollado por Grupo 8 - GDSI 2025** 🚀