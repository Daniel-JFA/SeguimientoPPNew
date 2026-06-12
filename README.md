# SSE - Sistema de Seguimiento a la Estrategia (SeguimientoPP_New)

Este proyecto representa la migración completa y estructurada del sistema heredado `seguimientoPP` (antes construido sobre un motor MVC en PHP monolítico) a una arquitectura moderna y escalable basada en **Angular (v19+)** con componentes independientes (Standalone) y gestión de estados mediante **Angular Signals**.

El objetivo de esta documentación es guiar tanto al equipo de desarrollo humano como a asistentes de inteligencia artificial (**Codex / Gemini / Copilot**) en la comprensión y evolución de la base de código.

---

## 🚀 Arquitectura del Proyecto

El proyecto está diseñado bajo un esquema modular y desacoplado:

```text
src/app/
├── app.config.ts          # Configuración global de Angular (HTTP, Rutas)
├── app.routes.ts          # Definición de rutas y guardianes de acceso
├── app.ts / app.html      # Componente raíz y maquetación general
├── guards/
│   └── auth.guard.ts      # Control de acceso basado en sesiones y roles
├── layout/                # Componentes comunes de interfaz
│   ├── header/            # Navbar dinámico con estado de autenticación
│   └── footer/            # Pie de página oficial
├── services/              # Capa de consumo de API y lógica de negocio
│   ├── auth.service.ts    # Manejo reactivo de sesiones con Angular Signals
│   ├── event.service.ts   # Agenda, sesiones, control de calidad y cargas
│   └── attendance.service.ts # Registro de firmas y consolidación FO-GINF-093
└── pages/                 # Componentes de páginas / Vistas
    ├── login/             # Control de acceso por roles (Auditor vs Mediador)
    ├── agenda/            # Calendario dinámico codificado por colores de calidad
    ├── reportar-evento/   # Formulario de sesiones, momentos y carga de anexos
    ├── registro-externo/  # Planilla digital de firmas (Firma en Canvas HTML5)
    └── reporte-asistencia/ # Formato imprimible FO-GINF-093 con métricas agregadas
```

---

## ⚙️ Reglas de Negocio Clave Migradas

### 1. Semáforo de Calidad y Estados de Conformidad
Para asegurar las metas del convenio, el sistema evalúa el cumplimiento de cada sesión:
*   **Sin evidencias / No Conforme (`#D97866`):** Ocurre si una sesión pasa más de 48 horas sin los documentos adjuntos mínimos o si el auditor de calidad la marca como rechazada. El mediador verá una alerta roja y las instrucciones del auditor para corregir subiendo nuevos archivos.
*   **En revisión (`#fdcae1`):** Sesión con documentos cargados que espera el visto bueno del supervisor de calidad.
*   **Aprobado / Conforme (Color estándar `#3182ce` o sin color):** Cumple con todos los requisitos. Se consolida para el cierre mensual.

### 2. Formato FO-GINF-093 (Asistencia y Caracterización)
El componente `reporte-asistencia` consolida y calcula en tiempo real los indicadores demográficos necesarios para las planillas oficiales:
*   **Género:** Hombre, Mujer, LGBTI/Otro.
*   **Rangos de Edad:** Jóvenes (14-28), Adultos (29-54), Adultos Mayores (55+).
*   **Enfoque Diferencial:** Mapea la participación de las 8 poblaciones priorizadas: LGTBI, Campesino, Indígena, Afrodescendiente, Víctima del conflicto, Discapacidad, Adulto Mayor y Ninguno.
*   **Firma Digitalizada:** Muestra la firma manuscrita recolectada mediante pantallas táctiles o mouse a través del lienzo HTML5.

---

## 🤖 Guía para Codex y Agentes de IA

Si eres un modelo de lenguaje que está modificando o agregando características a este proyecto, sigue estas directrices estrictas:

1.  **Componentes Standalone:** Todos los nuevos componentes deben ser independientes. Declara e importa sus dependencias directamente en el decorador `@Component`.
2.  **Angular Signals:** Utiliza Signals (`signal`, `computed`, `effect`) en lugar de RxJS/BehaviorSubjects para gestionar el estado reactivo del componente y la sesión de usuario.
3.  **HttpClient Providers:** Toda petición HTTP se centraliza en la capa de servicios (`src/app/services`). Asegúrate de que las API sigan retornando observables del tipo correcto.
4.  **Simulación de Datos (Mockups):** Para evitar fallos en entornos de desarrollo sin base de datos activa, mantén siempre bloques de fallback (`catchError` de RxJS retornando `of(...)`) con estructuras de datos idénticas a las esperadas de producción.
5.  **Alineación SCSS:** No utilices TailwindCSS o estilos ad-hoc en línea. Todas las reglas de diseño se definen de forma estructurada en los archivos `.scss` del componente respectivo o globalmente en `app.scss`.

---

## 🛠️ Ejecución Local

Para levantar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

o con Angular CLI:

```bash
ng serve
```

Accede a `http://localhost:4200/`.

### Usuarios de Prueba de Desarrollo:
*   **Auditor de Calidad (Level 1):** Usuario: `admin` / Clave: `admin`.
*   **Dinamizador / Mediador (Level 2):** Usuario: `mediador` / Clave: `mediador`.
