# La Rica Noche Web

Interfaz web del sistema **La Rica Noche**, un proyecto para la gestión de un pequeño alojamiento.  
Este frontend se conecta con la API del proyecto principal para manejar el flujo completo del sistema.

**Repositorio del backend:** https://github.com/MarcosZumaran/LaRicaNoche.Api

---

## Descripción

Este proyecto está construido con **React + Vite** y organiza la aplicación en módulos para trabajar con:

- autenticación e ingreso al sistema
- panel principal
- habitaciones
- clientes
- estancias
- productos
- comprobantes
- reportes
- ventas

La estructura del frontend está pensada para consumir la API y centralizar la lógica de navegación, protección de rutas y manejo de estado.

---

## Tecnologías usadas

- React
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Table
- React Hot Toast
- SweetAlert2
- Tailwind CSS
- DaisyUI
- Lucide React

---

## Instalación

### Requisitos
- Node.js
- npm

### Pasos

```bash
git clone https://github.com/MarcosZumaran/LaRicaNoche.Web.git
cd LaRicaNoche.Web
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto usando como base el ejemplo:

```bash
VITE_API_URL=https://localhost:1234/api
```

> Ajusta la URL según la dirección donde esté corriendo tu backend.

### Ejecutar en desarrollo

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

### Previsualizar la build

```bash
npm run preview
```

---

## Estructura general

```text
src/
├── api/
├── assets/
├── components/
├── contexts/
├── lib/
├── pages/
├── App.jsx
├── main.jsx
├── index.css
└── App.css
```

---

## Relación con el backend

El frontend depende de la API del backend para obtener y enviar información del sistema.

**Backend:**  
https://github.com/MarcosZumaran/LaRicaNoche.Api

El backend del proyecto está orientado a la gestión del hotel y trabaja con tecnologías como ASP.NET Core Web API, Entity Framework Core, SQL Server, Mapster y NLua.

---

## Funcionalidades principales

- Inicio de sesión
- Dashboard general
- Gestión de habitaciones
- Gestión de clientes
- Registro de estancias
- Gestión de productos
- Emisión y consulta de comprobantes
- Reportes y cierres
- Ventas e historial

---

## Nota

Este repositorio forma parte de un proyecto en desarrollo, por lo que su estructura y funcionalidades pueden seguir cambiando.

---

## Autor

**MarcosZumaran**

Repositorio del frontend:  
https://github.com/MarcosZumaran/LaRicaNoche.Web
