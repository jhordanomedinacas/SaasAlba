# Guía de cambios — Sistema de Entrenamiento Asesores

Referencia rápida de qué archivo tocar según lo que quieras modificar.

---

## Páginas

### Login (`/#/login`)
| Qué cambiar | Archivo |
|---|---|
| Diseño / formulario / animación de estrellas | `src/app/pages/Login.tsx` |
| Roles disponibles (Entrenador / Asesor) | `src/app/pages/Login.tsx` |

### Inicio / Dashboard (`/#/inicio`)
| Qué cambiar | Archivo |
|---|---|
| Tarjetas KPI (números, títulos, colores) | `src/app/pages/Inicio.tsx` |
| Perfiles de clientes | `src/app/pages/Inicio.tsx` |
| Tabla de historial de simulaciones | `src/app/pages/Inicio.tsx` |

### Historial de Chats (`/#/historial-chat`)
| Qué cambiar | Archivo |
|---|---|
| Lista de sesiones (estado, score, nivel, duración) | `src/app/pages/HistoryChats.tsx` |

### Práctica de Chat (`/#/historial-chat/:id`)
| Qué cambiar | Archivo |
|---|---|
| Página contenedora (envoltorio) | `src/app/pages/PracticaChat.tsx` |
| Interfaz del chat (mensajes, input, respuestas rápidas) | `src/app/components/ChatTraining.tsx` |
| Panel de información del pedido | `src/app/components/OrderInfoPanel.tsx` |
| Templates de respuestas predefinidas | `src/app/components/TemplatesPanel.tsx` |
| Escenarios de entrenamiento disponibles | `src/app/components/TrainingDashboard.tsx` |

### Mis Cursos (`/#/mis-cursos`)
| Qué cambiar | Archivo |
|---|---|
| Contenido de la página | `src/app/pages/MisCursos.tsx` |

### Certificaciones (`/#/certificaciones`)
| Qué cambiar | Archivo |
|---|---|
| Contenido de la página | `src/app/pages/Certificaciones.tsx` |

---

## Componentes globales

| Qué cambiar | Archivo |
|---|---|
| Menú lateral (links, logo, perfil, cerrar sesión) | `src/app/components/Sidebar.tsx` |
| Widget de accesibilidad (estilos del botón/spinner) | `src/app/components/AccessibilityWidget.tsx` |
| Lógica interna del widget (panel, funciones) | `public/accesibilidad.js` |
| Rutas de la app y estructura de layouts | `src/app/App.tsx` |

---

## Estilos

| Qué cambiar | Archivo |
|---|---|
| Colores globales / tema claro-oscuro | `src/styles/theme.css` |
| Fuentes | `src/styles/fonts.css` |
| Configuración base de Tailwind | `src/styles/tailwind.css` |

---

## Imágenes y assets

| Asset | Ubicación |
|---|---|
| Logo Alba (en widget y panel de accesibilidad) | `public/logo-alba.png` |
| Ícono del botón flotante del widget | `public/python.png` |
| Favicon | `public/logo-alba.png` |
| Imágenes de diseño/demo | `src/imports/image-0.png`, `src/imports/image-1.png` |

---

## Configuración del proyecto

| Qué cambiar | Archivo |
|---|---|
| Base URL para deploy (GitHub Pages) | `vite.config.ts` → `base` |
| Dependencias / scripts | `package.json` |
