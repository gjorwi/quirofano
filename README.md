# QuirófanoApp – Sistema de Gestión Quirúrgica

Sistema completo de administración y gestión de casos quirúrgicos con autenticación y control de acceso basado en roles.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🔐 Credenciales de Acceso

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Permisos:** Acceso completo al sistema

### Especialistas
- **Usuario:** `dr.montoya` / **Contraseña:** `pass123` (Dr. Andrés Montoya - Cirugía General)
- **Usuario:** `dr.solis` / **Contraseña:** `pass123` (Dra. Carmen Solís - Traumatología)
- **Usuario:** `dr.rojas` / **Contraseña:** `pass123` (Dr. Felipe Rojas - Neurocirugía)
- **Usuario:** `dr.cruz` / **Contraseña:** `pass123` (Dra. Valentina Cruz - Cardiocirugía)
- **Usuario:** `dr.palacios` / **Contraseña:** `pass123` (Dr. Hernán Palacios - Cirugía Pediátrica)
- **Usuario:** `dr.vargas` / **Contraseña:** `pass123` (Dra. Isabel Vargas - Ginecología)

### Personal de Admisión
- **Usuario:** `admision1` / **Contraseña:** `pass123` (Enf. Rosa Jiménez)
- **Usuario:** `admision2` / **Contraseña:** `pass123` (Enf. Pedro Acosta)

## 👥 Roles y Permisos

### 🔵 Administrador
**Acceso completo al sistema:**
- ✅ Dashboard con estadísticas generales
- ✅ Ver, aprobar y rechazar todos los casos quirúrgicos
- ✅ Programar casos en el plan quirúrgico (asignar fecha, hora, quirófano)
- ✅ Gestionar admisiones
- ✅ Acceso a todos los catálogos de configuración
- ✅ Gestión de usuarios del sistema

**Flujo de trabajo:**
1. Revisa casos propuestos por especialistas en `/casos`
2. Aprueba o rechaza cada caso
3. Programa casos aprobados en `/planes` (asigna quirófano, fecha y hora)
4. Monitorea el progreso de todos los casos

### 🟢 Especialista
**Acceso limitado a sus propios casos:**
- ✅ Proponer nuevos casos quirúrgicos (`/mis-casos/nuevo`)
- ✅ **Modal de selección de paciente** con búsqueda y registro rápido
- ✅ Ver estado de sus casos propuestos (pendiente, aprobado, rechazado)
- ✅ Ver programación asignada a sus casos (`/mi-agenda`)
- ✅ Seguimiento de casos en admisión y en curso
- ❌ No tiene acceso al dashboard general
- ❌ No puede aprobar casos
- ❌ No puede programar en el plan quirúrgico
- ❌ No puede ver casos de otros especialistas

**Flujo de trabajo:**
1. Propone caso quirúrgico con todos los detalles
2. Si el paciente no existe, lo registra desde el modal de selección
3. Espera aprobación del administrador
4. Una vez aprobado y programado, ve la fecha/hora/quirófano asignado
5. Hace seguimiento del caso hasta su finalización

### 🟠 Personal de Admisión
**Acceso exclusivo a admisión:**
- ✅ Registrar admisión de pacientes (`/admision`)
- ✅ Checklist preoperatorio
- ✅ Signos vitales
- ✅ Verificación de documentos
- ✅ Registro de insumos utilizados
- ❌ No puede ver casos no programados
- ❌ No puede acceder a configuración
- ❌ No puede ver el plan quirúrgico completo

**Flujo de trabajo:**
1. Ve lista de casos programados listos para admisión
2. Registra ingreso del paciente
3. Completa checklist preoperatorio
4. Registra signos vitales y documentos verificados
5. El caso pasa a estado "En Admisión"

## 📋 Flujo de Estados de un Caso

```
1. Pendiente       → Especialista propone caso
2. Aprobada        → Administrador aprueba
3. Rechazada       → Administrador rechaza (fin)
   ─────────────────────────────────────────
4. Programada      → Administrador asigna al plan quirúrgico
5. En Admisión     → Personal de admisión registra ingreso
6. En Curso        → Cirugía en proceso
7. Finalizado      → Cirugía completada
8. Cancelado       → Caso cancelado en cualquier momento
```

## 🗂️ Estructura del Proyecto

```
c:\repositorio\quirofano\
├── app/
│   ├── login/                    # Página de inicio de sesión
│   ├── dashboard/                # Dashboard (rol-específico)
│   ├── casos/                    # Gestión de casos (admin)
│   │   ├── nuevo/                # Crear caso (admin)
│   │   └── [id]/                 # Detalle de caso
│   ├── mis-casos/                # Casos del especialista
│   │   ├── nuevo/                # Proponer caso
│   │   └── [id]/                 # Detalle de mi caso
│   ├── mi-agenda/                # Agenda del especialista
│   ├── planes/                   # Plan quirúrgico (admin)
│   ├── admision/                 # Admisión (personal admisión)
│   ├── configuracion/            # Configuración (admin)
│   │   ├── usuarios/             # Gestión de usuarios
│   │   ├── pacientes/            # Catálogo de pacientes
│   │   ├── especialistas/        # Catálogo de especialistas
│   │   ├── quirofanos/           # Catálogo de quirófanos
│   │   ├── procedimientos/       # Catálogo de procedimientos
│   │   ├── diagnosticos/         # Catálogo de diagnósticos
│   │   └── insumos/              # Catálogo de insumos
│   ├── layout.js                 # Layout raíz con AppProvider
│   └── globals.css               # Estilos globales
├── components/
│   ├── AppProvider.js            # Context de autenticación y datos
│   ├── AppShell.js               # Shell con protección de rutas
│   ├── Sidebar.js                # Navegación lateral (rol-based)
│   ├── Header.js                 # Encabezado de páginas
│   ├── StatusBadge.js            # Badges de estado/prioridad
│   ├── CatalogPage.js            # Componente reutilizable CRUD
│   └── ProgramarPlanModal.js     # Modal para programar casos
├── lib/
│   ├── auth.js                   # Usuarios mock y roles
│   └── mockData.js               # Datos mock del sistema
├── jsconfig.json                 # Configuración de paths
├── next.config.js                # Configuración de Next.js
├── tailwind.config.js            # Configuración de Tailwind
└── package.json                  # Dependencias
```

## 🎨 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **UI:** React 18
- **Estilos:** Tailwind CSS 3
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Fechas:** date-fns
- **Lenguaje:** JavaScript (sin TypeScript)
- **Datos:** Mock data (sin backend)

## 🔧 Características Implementadas

### 📱 Diseño Mobile-First
- ✅ **Optimizado para teléfonos y tablets**
- ✅ Menú lateral responsive con hamburger menu
- ✅ Botones y formularios adaptados a pantallas táctiles
- ✅ Modal de selección de paciente mobile-friendly
- ✅ Grids y tablas responsive
- ✅ Padding y espaciado optimizado para móviles

### Autenticación y Seguridad
- ✅ Sistema de login con validación
- ✅ Sesión persistente (localStorage)
- ✅ Protección de rutas por rol
- ✅ Navegación dinámica según rol
- ✅ Logout funcional

### Gestión de Casos
- ✅ Creación de casos (especialistas y admin)
- ✅ **Modal inteligente de selección de paciente**
  - Búsqueda en tiempo real
  - Registro rápido de paciente nuevo
  - Selección con un click
- ✅ Aprobación/rechazo (admin)
- ✅ Filtros avanzados (estado, tipo, prioridad)
- ✅ Búsqueda en tiempo real
- ✅ Vista detallada con progreso visual
- ✅ Transiciones de estado

### Plan Quirúrgico
- ✅ Vista semanal y diaria
- ✅ Código de colores por quirófano
- ✅ Programación de casos (modal)
- ✅ Detección de conflictos de horario
- ✅ Cálculo automático de hora fin

### Admisión
- ✅ Registro de ingreso
- ✅ Checklist preoperatorio
- ✅ Signos vitales
- ✅ Verificación de documentos
- ✅ Registro de insumos

### Configuración
- ✅ CRUD completo de 7 catálogos
- ✅ Gestión de usuarios
- ✅ Activar/desactivar usuarios
- ✅ Vinculación especialista-usuario

## 📊 Datos Mock Incluidos

- **8 pacientes** con historias clínicas
- **6 especialistas** con disponibilidad
- **4 quirófanos** habilitados
- **10 procedimientos** quirúrgicos
- **10 diagnósticos** CIE-10
- **10 insumos** médicos
- **13 casos** en diferentes estados
- **8 planes** quirúrgicos programados
- **2 admisiones** registradas
- **9 usuarios** del sistema

## 🎯 Próximos Pasos (Opcional)

- [ ] Integración con backend real
- [ ] Notificaciones en tiempo real
- [ ] Reportes y estadísticas avanzadas
- [ ] Exportación a PDF
- [ ] Calendario interactivo drag & drop
- [ ] Chat entre especialistas
- [ ] Historial de cambios (audit log)
- [ ] Recuperación de contraseña
- [ ] 2FA (autenticación de dos factores)

## 📝 Notas Importantes

1. **Datos Mock:** Todo el sistema funciona con datos simulados. No hay conexión a base de datos.
2. **Sesión:** La sesión se guarda en `localStorage` con la clave `qx_session`.
3. **Roles:** Los roles están hardcodeados en `lib/auth.js`.
4. **Validaciones:** Las validaciones son básicas del lado del cliente.
5. **Estado:** El estado global se maneja con React Context (AppProvider).

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Error de rutas
Verificar que `jsconfig.json` existe con la configuración de `@/*` paths.

### Página en blanco después de login
Abrir DevTools Console para ver errores. Verificar que el rol del usuario existe en `NAV_BY_ROLE`.

---

**Desarrollado con Next.js 15 + Tailwind CSS 3**
