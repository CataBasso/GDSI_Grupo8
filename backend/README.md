# GDSI Backend API

Backend desarrollado con FastAPI para gestionar gastos compartidos y participantes.

## Características

- **CRUD completo** para participantes y gastos
- **Persistencia en JSON** para simplicidad
- **CORS habilitado** para integración con frontend
- **Validación de datos** con Pydantic
- **Documentación automática** con Swagger UI

## Instalación

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Ejecutar el servidor:
```bash
python main.py
```

El servidor estará disponible en `http://localhost:8000`

## Endpoints Disponibles

### Participantes
- `GET /participantes` - Obtener todos los participantes
- `POST /participantes` - Crear un nuevo participante
- `GET /participantes/{id}` - Obtener un participante por ID
- `PUT /participantes/{id}` - Actualizar un participante
- `DELETE /participantes/{id}` - Eliminar un participante

### Gastos
- `GET /gastos` - Obtener todos los gastos
- `POST /gastos` - Crear un nuevo gasto
- `GET /gastos/{id}` - Obtener un gasto por ID
- `PUT /gastos/{id}` - Actualizar un gasto
- `DELETE /gastos/{id}` - Eliminar un gasto

### Usuario Actual
- `GET /usuario-actual` - Obtener el usuario actual
- `PUT /usuario-actual` - Actualizar el usuario actual

### Utilidades
- `GET /database` - Obtener toda la base de datos
- `GET /health` - Verificar estado del servidor

## Documentación

Una vez que el servidor esté ejecutándose, puedes acceder a:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Estructura de Datos

### Participante
```json
{
  "id": "string",
  "nombre": "string",
  "email": "string",
  "telefono": "string",
  "unidad": "string",
  "activo": boolean
}
```

### Gasto
```json
{
  "id": "string",
  "descripcion": "string",
  "monto": number,
  "fecha": "string",
  "categoria": "string",
  "pagado_por": "string",
  "participantes": ["string"],
  "creado_por": "string"
}
```

### Usuario Actual
```json
{
  "id": "string",
  "nombre": "string",
  "email": "string",
  "unidad": "string"
}
```

## Persistencia

Los datos se guardan automáticamente en el archivo `data/database.json` cada vez que se realiza una operación de escritura.
