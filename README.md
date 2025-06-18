# ❄️ LogiRefrigeración

**LogiRefrigeración** es un sistema de gestión de logística y control de freezers para empresas de distribución de productos refrigerados. El sistema permite a administradores y operadores gestionar clientes, eventos de entrega y retiro de equipos, auditorías y más.

## 🚀 Tecnologías utilizadas

- **Frontend:** React JS + Vite
- **Estilo:** Material UI (MUI)
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Autenticación:** JWT (JSON Web Tokens)
- **ORM:** Ninguno (consultas SQL directas)
- **Control de versiones:** Git + GitHub

## 📦 Estructura del proyecto

```bash
logirefrigeracion/
│
├── backend/ # Servidor Express (Node.js)
│ ├── config/ # Configuración DB y JWT
│ ├── controllers/ # Lógica de negocio
│ ├── routes/ # Endpoints
│ └── ...
│
├── frontend/ # Aplicación React
│ ├── src/
│ │ ├── components/ # Componentes reutilizables (NavBar, Forms, etc.)
│ │ ├── pages/ # Páginas principales
│ │ ├── layouts/ # Layouts compartidos (DashboardLayout)
│ │ ├── api/ # Servicios axios
│ │ ├── context/ # Contextos globales (Auth, Notificaciones)
│ │ └── styles/ # Archivos CSS
│ └── ...
└── README.md
```

## 🧩 Funcionalidades

- Login con autenticación por rol (Administrador u Operador)
- Dashboard personalizado según el rol
- ABM de clientes, freezers y zonas
- Registro de eventos (entrega/retiro de freezers)
- Auditoría de actividades del sistema
- Módulo de notificaciones automáticas
- Validaciones de estado coherente de freezers
- Rutas protegidas con JWT
- Diseño responsive

## 🧪 Estado del proyecto

- [x] Backend funcional con rutas protegidas
- [x] Autenticación con JWT implementada
- [x] Sistema de auditoría listo
- [x] Validaciones de estados de cada entidad
- [x] Login funcional
- [ ] Frontend base
- [ ] UI de dashboards en desarrollo
- [ ] Integración completa frontend-backend

## 📸 Capturas

![Vista previa de la app](https://i.ibb.co/bMFzw2wx/A6-A7-C528-48-FB-4-E3-E-9-A58-B7-BE91-E92638.png)
![Vista previa de la app](https://i.ibb.co/gZ08C9RD/image.png)
## 🛠️ Instalación local

1. Clonar el repositorio:

```bash
git clone https://github.com/tuusuario/logirefrigeracion.git
cd logirefrigeracion
```

2. Instalar dependencias:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
Configurar archivos .env (tanto en frontend como backend)
```

3. Levantar el backend:
```bash
npm start
```
4. Levantar el frontend:
```bash
npm run dev
```
Asegurate de tener MySQL corriendo y la base de datos creada según el script logirefrigeracion.sql.

👩‍💻 Autora
Celina Fioretti – Proyecto académico para la carrera de Desarrollo de Software – Centro Regional Universitario IUA Universidad de la Defensa Nacional UNDEF Año 2025.
