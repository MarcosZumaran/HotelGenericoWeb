# La Rica Noche Web

Interfaz web del sistema **La Rica Noche**, desarrollada para consumir la API del proyecto y centralizar la gestión visual del alojamiento.

Repositorio del backend: https://github.com/MarcosZumaran/LaRicaNoche.Api

---

## Descripción

Este frontend está construido con **React + Vite** y está organizado por módulos para cubrir las funciones principales del sistema.

La aplicación permite trabajar con:

- autenticación e ingreso al sistema
- panel principal
- habitaciones
- clientes
- estancias
- productos
- comprobantes
- reportes
- ventas

La estructura del proyecto está pensada para mantener una navegación clara, separar responsabilidades y facilitar el consumo de la API.

---

## Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| React | Interfaz de usuario |
| Vite | Entorno de desarrollo y compilación |
| React Router | Navegación entre vistas |
| Axios | Consumo de servicios HTTP |
| React Hook Form | Manejo de formularios |
| Zod | Validación de datos |
| TanStack Table | Tablas y listados |
| React Hot Toast | Notificaciones |
| SweetAlert2 | Alertas y confirmaciones |
| Tailwind CSS | Estilos utilitarios |
| DaisyUI | Componentes visuales |
| Lucide React | Iconografía |

---

## Características

- Inicio de sesión
- Navegación por módulos
- Gestión visual de entidades del sistema
- Consumo centralizado de la API
- Validación de formularios
- Tablas para listados y administración de datos
- Mensajes visuales para acciones y errores

---

## Requisitos previos

- Node.js
- npm
- Backend del sistema ejecutándose correctamente

---

## Instalación

```bash
git clone https://github.com/MarcosZumaran/LaRicaNoche.Web.git
cd LaRicaNoche.Web
npm install
```

---

## Configuración

Crea un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
VITE_API_URL=https://localhost:5001/api
```

Ajusta la URL según la dirección real del backend.

---

## Ejecución en desarrollo

```bash
npm run dev
```

---

## Compilación para producción

```bash
npm run build
```

---

## Previsualización de la compilación

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

Este frontend depende de la API para obtener y registrar información del sistema.

Backend del proyecto:  
https://github.com/MarcosZumaran/LaRicaNoche.Api

Flujo general:

```text
Usuario -> Frontend -> API -> Base de datos
```

---

## Nota importante

> Este proyecto fue creado con fines de práctica institucional y no tiene fines comerciales.

> El sistema puede seguir evolucionando, por lo que la estructura y las funcionalidades pueden cambiar con el tiempo.

---

## Autor

MarcosZumaran

Repositorio:  
https://github.com/MarcosZumaran/LaRicaNoche.Web
