# 🏢 MiConsorcio - Sistema de Gestión de Gastos Compartidos

Una aplicación web moderna para administrar gastos compartidos en consorcios autogestionados. Permite a cada socio registrar gastos comunes y calcular automáticamente cuánto debe aportar o recuperar cada miembro al final del mes.

## 👥 Integrantes del Grupo 8

- **Catalina Basso**
- **Abril Giordano Hoyo** 
- **Cristobal Alvarez**
- **Mateo Castaño**
- **Alejandro Paff**

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** (versión 16 o superior)
- **Python** (versión 3.8 o superior)
- **npm** o **yarn**

### Instalación y Ejecución

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd GDSI_Grupo8
```

2. **Instalar dependencias del frontend:**
```bash
npm install
```

3. **Instalar dependencias del backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

4. **Ejecutar ambos servidores:**

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

5. **Acceder a la aplicación:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

## 🔐 Credenciales de Prueba

| Email | Contraseña | Usuario | Unidad |
|-------|------------|---------|--------|
| maria@email.com | maria123 | María González | 2A |
| carlos@email.com | carlos123 | Carlos Rodriguez | 1B |
| ana@email.com | ana123 | Ana Martínez | 4D |
| juan@email.com | juan123 | Juan Pérez | 3C |

## 🏗️ Arquitectura del Sistema

### Frontend (React + TypeScript)
- **Framework:** React 18 con TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS + Shadcn/ui
- **Estado:** Context API para autenticación
- **HTTP Client:** Fetch API nativo

### Backend (FastAPI + Python)
- **Framework:** FastAPI
- **Validación:** Pydantic
- **Persistencia:** JSON (archivo `backend/data/database.json`)
- **CORS:** Configurado para desarrollo
- **Documentación:** Swagger UI automática

## 📋 Funcionalidades Principales

### ✅ Gestión de Participantes
- Registro de miembros del consorcio por base de datos
- Información de contacto y unidad
- Estado activo/inactivo

### ✅ Gestión de Gastos
- Registro de gastos compartidos
- Categorización por tipo (mantenimiento, jardinería, mejoras, etc.)
- Asignación de quien pagó y quiénes deben aportar
- Cálculo automático de proporciones

### ✅ Sistema de Pagos
- Registro de pagos entre participantes
- Comprobantes de pago
- Seguimiento de deudas

### ✅ Dashboard y Resúmenes
- Balance individual de cada participante
- Resumen de gastos por categoría
- Historial de transacciones

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de UI
- **React Router** - Navegación
- **Lucide React** - Iconos

### Backend
- **FastAPI** - Framework web moderno
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI
- **Python 3.8+** - Lenguaje de programación

## 📁 Estructura del Proyecto

```
GDSI_Grupo8/
├── 📁 backend/                    # API FastAPI
│   ├── 📁 data/
│   │   └── 📄 database.json       # Base de datos JSON
│   ├── 📄 main.py                 # API principal
│   ├── 📄 run.py                  # Script de ejecución
│   ├── 📄 requirements.txt        # Dependencias Python
│   └── 📄 README.md               # Documentación del backend
├── 📁 src/                        # Código fuente React
│   ├── 📁 components/             # Componentes reutilizables
│   ├── 📁 contexts/               # Contextos de React
│   ├── 📁 hooks/                  # Custom hooks
│   ├── 📁 lib/                    # Utilidades y servicios
│   └── 📁 pages/                  # Páginas principales
├── 📁 public/                     # Archivos estáticos
├── 📄 package.json                # Configuración Node.js
├── 📄 vite.config.ts              # Configuración Vite
└── 📄 README.md                   # Este archivo
```

## 🔧 Comandos Útiles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter de código
```

### Backend
```bash
python run.py        # Ejecutar servidor
python -m uvicorn main:app --reload  # Servidor con recarga automática
```

## 🌐 API Endpoints

### Usuarios
- `POST /login` - Iniciar sesión

### Participantes
- `GET /participantes` - Listar todos los participantes
- `POST /participantes` - Crear nuevo participante
- `GET /participantes/{id}` - Obtener participante por ID
- `PUT /participantes/{id}` - Actualizar participante
- `DELETE /participantes/{id}` - Eliminar participante

### Gastos
- `GET /gastos` - Listar todos los gastos
- `POST /gastos` - Crear nuevo gasto
- `GET /gastos/{id}` - Obtener gasto por ID
- `PUT /gastos/{id}` - Actualizar gasto
- `DELETE /gastos/{id}` - Eliminar gasto

### Pagos
- `GET /pagos` - Listar todos los pagos
- `POST /pagos` - Crear nuevo pago
- `GET /pagos/{id}` - Obtener pago por ID
- `PUT /pagos/{id}` - Actualizar pago
- `DELETE /pagos/{id}` - Eliminar pago

### Utilidades
- `GET /usuario-actual` - Obtener usuario actual
- `PUT /usuario-actual` - Actualizar usuario actual
- `POST /upload/comprobante` - Cargar comprobante
- `POST /upload/comprobante/{filename}` - Obtener comprobante
- `GET /health` - Estado del servidor

## 📊 Persistencia de Datos

Los datos se almacenan en un archivo JSON (`backend/data/database.json`) que incluye:
- Lista de usuarios
- Lista de participantes
- Historial de gastos
- Registro de pagos
- Usuario actual activo

## 🔄 Flujo de Trabajo

1. **Login:** El usuario inicia sesión con sus credenciales
2. **Dashboard:** Ve su balance personal y gastos recientes
3. **Agregar Gasto:** Registra un nuevo gasto compartido
4. **Saldar Deudas:** Registra pagos entre participantes
5. **Resumen:** Consulta balances y reportes

## 🚀 Despliegue

### Desarrollo
Los servidores se ejecutan en:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## 📝 Licencia

Este proyecto es parte del Trabajo Práctico de la materia GDSI (Gestión de Datos y Sistemas de Información).