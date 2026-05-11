# Project Context: HotelGenericoWeb

## 1. Visión General

Aplicación SPA (Single Page Application) para el sistema de gestión hotelera **Hotel Genérico**. Desarrollada con **React 19**, **Vite 8**, **Tailwind CSS 3 + DaisyUI 4**. Proporciona interfaz para gestión de habitaciones, clientes, reservas, check-in/out, ventas, productos, comprobantes electrónicos y reportes. Incluye **SignalR** para actualizaciones en tiempo real, **Chart.js** para dashboard, y **FullCalendar** para calendario de reservas.

Se conecta a la API REST `HotelGenericoApi` (`http://localhost:5054`).

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.2.5 | Librería UI |
| Vite | 8.0.10 | Bundler / Dev Server |
| Tailwind CSS | 3.4.19 | Estilos utilitarios |
| DaisyUI | 4.12.24 | Componentes pre-diseñados |
| React Router DOM | 7.14.2 | Enrutamiento |
| FullCalendar | 6.1.20 | Calendario de reservas |
| Chart.js | 4.5.1 | Gráficos |
| react-chartjs-2 | 5.3.1 | Wrapper React para Chart.js |
| @tanstack/react-table | 8.21.3 | Tablas con ordenamiento |
| React Hook Form | 7.74.0 | Formularios |
| Zod | 4.4.1 | Validación de esquemas |
| Axios | 1.15.2 | Cliente HTTP |
| @microsoft/signalr | 10.0.0 | WebSockets (tiempo real) |
| SweetAlert2 | 11.26.24 | Modales de notificación |
| date-fns | 4.1.0 | Manejo de fechas |
| date-fns-tz | 3.2.0 | Soporte de zonas horarias |
| Lucide React | 1.14.0 | Iconografía |
| React DayPicker | 9.14.0 | Selector de fechas |
| react-hot-toast | 2.6.0 | Toast de notificaciones |
| @formkit/auto-animate | 0.9.0 | Animaciones automáticas |
| @react-pdf-viewer/core | 3.12.0 | Visor de PDF |
| pdfjs-dist | 3.11.174 | Motor PDF (dependencia de @react-pdf-viewer) |
| @hookform/resolvers | 5.2.2 | Resolver Zod para React Hook Form |

## 3. Estructura del Proyecto

```
HotelGenericoWeb/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js              # Cliente Axios (interceptors JWT)
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx  # Layout principal (drawer + navbar)
│   │   │   ├── Navbar.jsx           # Barra superior (tema, usuario, logout)
│   │   │   └── Sidebar.jsx          # Menú lateral dinámico por rol
│   │   ├── ui/
│   │   │   ├── LoadingButton.jsx    # Botón con estado de carga
│   │   │   ├── Paginacion.jsx       # Componente de paginación
│   │   │   └── PdfViewerModal.jsx   # Modal visor de PDF
│   │   └── ProtectedRoute.jsx      # Ruta protegida por autenticación
│   ├── contexts/
│   │   └── AuthContext.jsx          # Estado global de autenticación
│   ├── hooks/
│   │   ├── useSignalR.js           # Hook de conexión SignalR
│   │   └── useTheme.js             # Hook de tema oscuro/claro
│   ├── lib/
│   │   └── swal.js                 # Instancia global de SweetAlert2
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── Login.jsx           # Página de inicio de sesión
│   │   │   └── loginSchema.js      # Schema de validación del login
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx       # Panel principal con KPIs y gráficos
│   │   ├── Habitaciones/
│   │   │   ├── HabitacionList.jsx  # Gestión de habitaciones (cartas + modales)
│   │   │   └── habitacionSchema.js # Schema de validación
│   │   ├── Clientes/
│   │   │   ├── ClienteList.jsx     # CRUD de clientes
│   │   │   └── clienteSchema.js    # Schema de validación
│   │   ├── Productos/
│   │   │   ├── ProductoList.jsx    # CRUD de productos
│   │   │   └── productoSchema.js   # Schema de validación
│   │   ├── Ventas/
│   │   │   ├── VentaList.jsx       # Carrito de ventas
│   │   │   ├── HistorialVentas.jsx # Historial de ventas
│   │   │   └── ventaSchema.js      # Schema de validación
│   │   ├── Estancias/
│   │   │   ├── CheckIn.jsx         # Check-in independiente
│   │   │   ├── CheckOut.jsx        # Check-out independiente
│   │   │   ├── HistorialEstancias.jsx # Historial de estancias
│   │   │   └── checkinSchema.js    # Schema de validación check-in
│   │   ├── Comprobantes/
│   │   │   └── ComprobanteList.jsx # Listado de comprobantes
│   │   └── Reportes/
│   │       ├── CierreCaja.jsx      # Reporte de cierre de caja
│   │       └── EstadoHabitaciones.jsx # Reporte de estado de habs.
│   ├── App.css
│   ├── App.jsx                    # Router principal
│   ├── index.css                  # Estilos globales + animaciones
│   └── main.jsx                   # Punto de entrada
├── index.html
├── tailwind.config.js             # Configuración de Tailwind + DaisyUI
├── vite.config.js                 # Configuración de Vite
├── postcss.config.js
├── eslint.config.js
├── .env                           # Variables de entorno
├── .env.example
└── package.json
```

## 4. Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                     HotelGenericoWeb                      │
├──────────────────────────────────────────────────────────┤
│ BrowserRouter (React Router DOM 7)                       │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ AuthContext (Provider global)                       │  │
│ │ ├─ user: { username, nombreRol }                   │  │
│ │ ├─ token: JWT string                               │  │
│ │ ├─ login(username, password) → api/Usuario/login   │  │
│ │ └─ logout()                                        │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ DashboardLayout                                     │  │
│ │ ├── Navbar (tema, avatar, botón salir)              │  │
│ │ ├── Sidebar (menú dinámico por rol)                 │  │
│ │ └── <Outlet /> (contenido de página)                │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Axios Client (api/axios.js)                         │  │
│ │ ├─ Interceptor request: añade JWT Bearer            │  │
│ │ └─ Interceptor response: 401 → redirige a /login    │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ SignalR (useSignalR hook)                           │  │
│ │ ├─ Conexión: /hub/habitaciones                      │  │
│ │ ├─ Reconexión automática                            │  │
│ │ └─ Evento: EstadoHabitacionCambiado                 │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ useTheme (oscuro/claro con animación circular)      │  │
│ │ ├─ localStorage: 'theme' = 'light' | 'dark'         │  │
│ │ ├─ CSS class: .dark en <html>                       │  │
│ │ └─ DaisyUI data-theme attribute                     │  │
│ └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 5. Rutas (React Router DOM 7)

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/login` | Login | Público |
| `/dashboard` | Dashboard | Todos |
| `/habitaciones` | HabitacionList | Todos |
| `/clientes` | ClienteList | Admin, Recepcionista |
| `/productos` | ProductoList | Admin |
| `/ventas` | VentaList | Admin, Recepcionista |
| `/ventas/historial` | HistorialVentas | Admin, Recepcionista |
| `/estancias/historial` | HistorialEstancias | Admin, Recepcionista |
| `/comprobantes` | ComprobanteList | Admin |
| `/reportes/cierre-caja` | CierreCaja | Admin |
| `*` | → redirect a `/dashboard` | - |

## 6. Roles y Permisos en UI

Sidebar filta items según `user.nombreRol`:

| Funcionalidad | Admin | Recepcionista | Limpieza |
|:---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Habitaciones (CRUD) | ✓ | ✗ | ✗ |
| Habitaciones (cambio estado manual) | ✓ | ✗ | Finalizar limpieza |
| Clientes (CRUD) | ✓ | ✓ | ✗ |
| Productos (CRUD) | ✓ | ✗ | ✗ |
| Ventas | ✓ | ✓ | ✗ |
| Comprobantes | ✓ | ✗ | ✗ |
| Cierre de Caja | ✓ | ✗ | ✗ |
| Check‑In / Check‑Out | ✓ | ✓ | ✗ |
| Reservas | ✓ | ✓ | ✗ |

## 7. Flujo de Páginas y Componentes

### Login (`/login`)
- Formulario con username + password
- Validación con Zod
- LoadingButton con efecto shimmer
- Guarda token y usuario en localStorage
- Redirige según rol (todos van a /dashboard)

### Dashboard (`/dashboard`)
- 4 tarjetas KPI: Total Habitaciones, Ocupadas, Disponibles, Ingresos Hoy
- Gráfico Doughnut de ocupación (Chart.js)
- Gráfico Bar de top 5 productos (30 días)
- Tabla de estado de habitaciones
- Carga datos via 3 endpoints paralelos

### Habitaciones (`/habitaciones`)
- Cuadrícula de cartas con colores por estado:
  - 🟢 Disponible (success)
  - 🟡 Ocupada (warning)
  - 🔵 Limpieza (info)
  - 🔴 Mantenimiento (error)
- Modal de detalle con pestañas:
  - Información de la habitación
  - Estancia activa (con barra de progreso)
  - Acciones contextuales según estado
  - Consumos (agregar/editar/eliminar)
  - Calendario FullCalendar de reservas
- Tooltip flotante en eventos del calendario
- **SignalR**: actualiza todo en tiempo real
- CRUD admin (crear/editar/eliminar)

### Clientes (`/clientes`)
- Tabla con búsqueda por documento
- Formulario modal de creación/edición
- Campos: tipo documento, documento, nombres, apellidos, nacionalidad, fecha nacimiento, teléfono, email, dirección

### Productos (`/productos`)
- Tabla con CRUD
- Campos: nombre, descripción, precio unitario, categoría, stock, stock mínimo, unidad medida, afectación IGV

### Ventas (`/ventas`)
- Carrito de compras
- Búsqueda de cliente por documento
- Seleccionar productos + cantidad
- Método de pago
- Cliente anónimo opcional
- Validación: boletas anónimas ≤ S/700

### Check-In / Reserva (modal en HabitacionList)
- Toggle: "Ahora (Entrada)" o "Reserva"
- Formulario de cliente (tipo doc, número, nombres, apellidos, teléfono)
- Selector de fechas con DayPicker (navegación por años)
- Método de pago
- Checkbox cliente anónimo
- Validación de solapamiento de reservas

### Check-Out (modal en HabitacionList)
- Confirmación con nombre del cliente
- La habitación pasa a Limpieza automáticamente
- Muestra comprobante generado

### Comprobantes (`/comprobantes`)
- Listado con detalle
- Visualización de PDF en modal
- Descarga e impresión
- Simulación de envío a SUNAT

### Reportes
- **Cierre de Caja**: Filtro por fecha, exportación Excel y PDF
- **Estado de Habitaciones**: Tabla con exportación Excel
- **Top Productos**: Gráfico en dashboard

## 8. Hooks Personalizados

### `useSignalR(onMessageReceived)`
- Conecta a `/hub/habitaciones` con token JWT
- Reconexión automática
- Escucha evento `EstadoHabitacionCambiado`
- Limpia conexión al desmontar

### `useTheme()`
- Retorna `{ theme, toggleTheme }`
- Persiste en localStorage
- Animación circular con View Transitions API (fallback CSS)
- Escucha preferencia del sistema (`prefers-color-scheme`)

## 9. Estilos y UI

### Tailwind + DaisyUI
- **Tema claro**: primary blue (#2563eb), base-100 white
- **Tema oscuro**: primary blue (#3b82f6), base-100 slate-900
- **Font**: Inter (Google Fonts)
- **Transiciones**: `transition-colors duration-200` en todos los elementos

### Animaciones
- **Shimmer**: botones de carga con gradiente animado
- **Fade-in scale**: cartas de habitaciones al aparecer
- **View transition**: cambio de tema circular
- **DaisyUI**: loading spinner, badge, drawer

### Glassmorphism
- Modal de detalle: `bg-base-100/90 backdrop-blur-xl`
- Bordes redondeados (rounded-2xl)

## 10. Componentes UI Reutilizables

### `LoadingButton`
- Extiende `<button>` de DaisyUI
- Muestra spinner loading + texto "Cargando..."
- Prop `isLoading` para controlar estado

### `Paginacion`
- Controles de página anterior/siguiente
- Muestra: "Página X de Y"

### `PdfViewerModal`
- Modal con visor de PDF (react-pdf-viewer)
- Botones de descarga e impresión

## 11. SeñalR

- **Hook**: `useSignalR` (src/hooks/useSignalR.js)
- **Endpoint**: `/hub/habitaciones` (proxy Vite → `http://localhost:5054`)
- **Evento**: `EstadoHabitacionCambiado`
- **Acción al recibir**: recargar datos de habitaciones y dashboard
- **Ventaja**: actualización en tiempo real en todas las pestañas abiertas

## 12. Configuración

### Entorno (`.env`)
```
VITE_API_URL=http://localhost:5054/api
```

### Vite Proxy (vite.config.js)
```js
server: {
  proxy: {
    '/hub': {
      target: 'http://localhost:5054',
      ws: true,
      changeOrigin: true,
    }
  }
}
```

Esto permite que SignalR funcione sin CORS en websocket.

## 13. Flujo de Autenticación

1. Usuario ingresa credentials en `/login`
2. `POST /api/Usuario/login` → retorna `{ token, usuario }`
3. AuthContext guarda token + user en state y localStorage
4. Axios interceptor añade `Authorization: Bearer {token}` a todas las requests
5. Si response 401 (excepto login), redirige a `/login`
6. ProtectedRoute verifica `user != null` para rutas protegidas

## 14. Decisiones Técnicas

| Decisión | Razón |
|----------|-------|
| FullCalendar vs react-big-calendar | FullCalendar más estable, mejor integración |
| Zod vs Yup | Zod tiene mejor rendimiento y tipado |
| Axios interceptors | Manejo centralizado de errores 401 |
| DaisyUI themes | Tema oscuro/claro fácil con data-theme |
| react-day-picker | Selector de fechas con navegación por años |
| react-hot-toast | Notificaciones ligeras no obstructivas |
| @formkit/auto-animate | Animaciones sin esfuerzo en listas |
| SweetAlert2 con lib/swal.js | Personalización global de modales |
| Vite proxy para SignalR | Evita problemas de CORS con WebSocket |

## 15. Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| @vitejs/plugin-react | 6.0.1 | Plugin React para Vite |
| eslint | 10.2.1 | Linter |
| eslint-plugin-react-hooks | 7.1.1 | Reglas ESLint para hooks |
| eslint-plugin-react-refresh | 0.5.2 | Refresh rápido con ESLint |
| autoprefixer | 10.5.0 | Prefixes CSS |
| postcss | 8.5.12 | Procesador CSS |

## 16. Scripts de Compilación

```bash
npm run dev      # Inicia dev server (http://localhost:5173)
npm run build    # Producción build
npm run lint     # ESLint
npm run preview  # Preview de build producción
```

## 17. Puertos

- **Dev server**: `http://localhost:5173`
- **API**: `http://localhost:5054/api`
- **SignalR**: `/hub/habitaciones` (proxy Vite → API)
