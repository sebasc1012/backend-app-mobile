# Finanzas al Día — Contexto del Backend

## Propósito del producto

**Finanzas al Día** es una aplicación móvil para ayudar a las personas a organizar y gestionar sus compromisos financieros recurrentes, conocer sus próximos vencimientos, recibir recordatorios y registrar sus pagos.

El producto no procesa pagos ni realiza transferencias. En el MVP, la aplicación únicamente permite **registrar que un pago fue realizado**.

Apple y Google se incorporan como proveedores de **inicio de sesión social** mediante Supabase Auth y no como mecanismos de pago.

---

# MVP definido

El MVP contempla:

1. Crear una cuenta o iniciar sesión mediante:
   - Email/contraseña.
   - Google.
   - Sign in with Apple.

2. Gestionar el perfil del usuario.

3. Crear y gestionar compromisos financieros.

4. Clasificar los compromisos mediante categorías.

5. Configurar la recurrencia de cada compromiso.

6. Consultar los próximos vencimientos.

7. Generar y consultar ocurrencias concretas de los compromisos.

8. Recibir recordatorios antes del vencimiento.

9. Registrar un pago realizado.

10. Consultar el historial de vencimientos y pagos.

## Fuera del MVP

Quedan fuera del MVP:

- Procesamiento de pagos.
- Transferencias.
- Apple Pay.
- Google Pay.
- Integraciones bancarias.
- Sincronización automática con cuentas bancarias.
- Conciliación automática de movimientos.
- Amortización de préstamos.
- Cálculo de intereses.
- Gestión de saldo pendiente de préstamos.
- Pagos parciales.
- Múltiples abonos para una misma ocurrencia.
- Presupuestos avanzados.
- Inversiones.
- Analítica financiera avanzada.
- Reportes financieros avanzados.
- Historial avanzado de notificaciones.

Los préstamos **sí pueden registrarse como compromisos financieros de tipo `DEBT`**, pero el MVP no calcula amortización, intereses ni saldo pendiente.

---

# Stack técnico

### Móvil

- React Native.
- Expo.
- Expo Router.
- TypeScript.
- NativeWind.

### Backend

- Node.js 22.
- Express 5.
- TypeScript.
- Prisma 7.

### Base de datos

- PostgreSQL.

### Identidad y autenticación

- Supabase Auth.
- Email/Password.
- Google.
- Sign in with Apple.

### Validación

- Zod en cliente y servidor.

### Datos remotos en móvil

- Axios.
- TanStack Query.

### Sesión móvil

- Supabase JS.
- Expo SecureStore.

### Entrega

- EAS Build/Submit para móvil.
- Railway o Render para el backend inicial.

---

# Principios de implementación

- Aplicar SOLID y Clean Code.
- Mantener responsabilidades explícitas.
- Utilizar funciones pequeñas y cohesivas.
- Mantener errores de dominio consistentes.
- Organizar el backend por módulos de dominio.
- Evitar una arquitectura global organizada únicamente por tipo de archivo.
- Separar HTTP, lógica de negocio y persistencia.
- Utilizar Zod para validar los límites de entrada.
- Utilizar Prisma como ORM y capa principal de acceso a PostgreSQL.
- Mantener la identidad de Supabase separada de los datos de negocio.
- Utilizar el UUID del usuario autenticado como identidad de referencia.
- Nunca confiar en un `userId` enviado por el cliente para determinar el propietario de un recurso.
- Todo recurso financiero perteneciente a un usuario debe validarse por ownership.
- Mantener la lógica de recurrencia en el backend.
- Evitar triggers de PostgreSQL para implementar lógica de negocio.
- Utilizar transacciones cuando una operación de negocio requiera modificar múltiples entidades de manera atómica.

---

# Modelo conceptual

El dominio financiero se divide en tres conceptos principales:

```text
financial_commitment
        │
        │ 1:N
        ▼
   occurrence
        │
        │ 1:0..1
        ▼
     payment
```

### Financial Commitment

Representa la configuración permanente del compromiso financiero.

Ejemplos:

- Netflix.
- Spotify.
- Arriendo del apartamento.
- Arriendo de una oficina.
- Internet.
- Crédito bancario.

Un usuario puede tener tantos compromisos como necesite.

### Occurrence

Representa un vencimiento concreto generado a partir de un compromiso.

Por ejemplo:

```text
Arriendo
 ├── 2026-09-01
 ├── 2026-10-01
 ├── 2026-11-01
 └── ...
```

Las ocurrencias permiten mantener el historial de vencimientos.

### Payment

Representa el registro de que una ocurrencia fue pagada.

En el MVP:

```text
occurrence 1 ─── 0..1 payment
```

No se contemplan pagos parciales ni múltiples abonos.

---

# Modelo de datos

## `profiles`

Representa la información adicional del usuario autenticado.

```text
PK id UUID

full_name TEXT
gender TEXT
country CHAR(2)
phone TEXT
avatar_url TEXT

onboarding_completed BOOLEAN
notifications_enabled BOOLEAN

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
deleted_at TIMESTAMPTZ
```

`profiles.id` utiliza el mismo UUID que el usuario de `auth.users`.

Relación:

```text
auth.users 1:1 profiles
```

El perfil utiliza `deleted_at` para eliminación lógica.

---

## `categories`

Representa las categorías reutilizables de los compromisos financieros.

```text
PK id UUID

name TEXT UNIQUE

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Ejemplos de categorías:

- Vivienda.
- Suscripciones.
- Servicios.
- Educación.
- Préstamos.
- Otros.

Una categoría puede utilizarse en múltiples compromisos.

Las categorías **no limitan la cantidad de compromisos**.

Por ejemplo:

```text
Suscripciones
 ├── Netflix
 ├── Spotify
 └── Disney+

Vivienda
 ├── Arriendo apartamento
 └── Arriendo oficina
```

---

## `financial_commitments`

Representa el compromiso financiero que el usuario desea gestionar.

```text
PK id UUID

FK user_id UUID
FK category_id UUID

type TEXT
name TEXT
description TEXT
default_amount NUMERIC(14,2)

frequency TEXT
start_date DATE
recurrence_day SMALLINT
next_due_date DATE
reminder_days_before SMALLINT

end_date DATE
status TEXT

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `type`

Valores definidos:

```text
DEBT
OBLIGATION
```

No existen tablas separadas para deudas y obligaciones.

### `frequency`

Valores definidos:

```text
BIWEEKLY
MONTHLY
QUARTERLY
SEMIANNUALLY
ANNUALLY
```

### `status`

Valores definidos:

```text
ACTIVE
COMPLETED
CANCELLED
```

### `default_amount`

Es el monto esperado o de referencia del compromiso.

No representa necesariamente el monto efectivamente pagado.

El monto efectivamente pagado pertenece a `payments.paid_amount`.

---

# Recurrencia

La configuración de recurrencia se almacena en `financial_commitments`.

Se utilizan:

```text
frequency
start_date
recurrence_day
next_due_date
```

### BIWEEKLY

La recurrencia se calcula cada 14 días tomando `start_date` como referencia.

`recurrence_day` no es necesario para esta frecuencia.

### Frecuencias de calendario

Para:

```text
MONTHLY
QUARTERLY
SEMIANNUALLY
ANNUALLY
```

se utiliza `recurrence_day` como día esperado del periodo.

Si el día configurado no existe en un determinado mes, se utilizará el último día disponible de ese mes.

El sistema **no genera indefinidamente todos los vencimientos futuros**.

Las ocurrencias se generan cuando son necesarias y se conserva el historial de las ocurrencias ya creadas.

---

# `next_due_date`

`next_due_date` representa el próximo vencimiento operativo de un compromiso.

Su objetivo principal es permitir consultas eficientes como:

```text
¿Cuáles son los próximos compromisos del usuario?
```

El valor es mantenido por el backend y debe permanecer consistente con la configuración de recurrencia y las ocurrencias.

`next_due_date` es una forma de estado operacional/denormalizado y no debe convertirse en una segunda fuente independiente de verdad.

Cuando una ocurrencia es pagada, el backend debe determinar y mantener correctamente el siguiente vencimiento.

La actualización de información relacionada con el pago y la recurrencia debe realizarse de manera transaccional cuando corresponda.

---

# `occurrences`

Representa un vencimiento concreto.

```text
PK id UUID

FK financial_commitment_id UUID

due_date DATE
status TEXT

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Restricción:

```text
UNIQUE(financial_commitment_id, due_date)
```

### Estados

```text
PENDING
PAID
```

No existe un estado persistido `OVERDUE`.

Una ocurrencia se considera vencida cuando:

```text
status = PENDING
AND
due_date < CURRENT_DATE
```

Por lo tanto, `OVERDUE` es un estado derivado.

---

# `payments`

Representa el registro de un pago realizado sobre una ocurrencia.

```text
PK id UUID

FK occurrence_id UUID UNIQUE

paid_amount NUMERIC(14,2)
paid_at TIMESTAMPTZ

created_at TIMESTAMPTZ
```

La relación es:

```text
occurrence 1 ─── 0..1 payment
```

`paid_amount` es opcional.

Esto permite que el usuario pueda seleccionar:

> Marcar como pagado

sin necesidad de introducir el monto.

En el MVP no se permiten múltiples pagos o abonos para una misma ocurrencia.

---

# Arquitectura de relaciones

```text
Supabase Auth
      │
      │ 1:1
      ▼
   profiles
      │
      │ 1:N
      ▼
financial_commitments
      │
      ├────────── N:1 ────────── categories
      │
      │ 1:N
      ▼
 occurrences
      │
      │ 1:0..1
      ▼
  payments
```

---

# Flujo de autenticación

1. La aplicación móvil utiliza Supabase Auth.
2. El usuario puede autenticarse mediante email/contraseña, Google o Apple.
3. Supabase proporciona una sesión con `access_token`.
4. La aplicación móvil envía:

```text
Authorization: Bearer <access_token>
```

5. El backend valida la identidad del usuario.
6. El backend obtiene el UUID del usuario autenticado.
7. El backend utiliza ese UUID para consultar o modificar los recursos pertenecientes al usuario.
8. El backend crea o actualiza el perfil utilizando únicamente la identidad autenticada.

El `userId` no debe recibirse del body como mecanismo para determinar ownership.

---

# Seguridad y ownership

Todos los recursos financieros pertenecientes a un usuario deben estar aislados por su identidad autenticada.

Por ejemplo, para consultar compromisos:

```text
GET /api/commitments
```

El usuario se obtiene del contexto de autenticación.

No se debe utilizar:

```text
GET /api/commitments?userId=123
```

como mecanismo de autorización.

Para recursos identificados por ID, el backend debe comprobar que el recurso pertenece al usuario autenticado antes de permitir su lectura o modificación.

---

# Eliminación de cuenta

El perfil utiliza eliminación lógica mediante:

```text
deleted_at = NOW()
```

Un perfil activo se identifica mediante:

```text
deleted_at IS NULL
```

El soft delete se aplica inicialmente al perfil y no se agrega automáticamente a todas las entidades financieras.

La eliminación lógica del perfil no elimina automáticamente el usuario de Supabase Auth ni implica el cierre de sesión.

La eliminación física del usuario de `auth.users`, si se implementa posteriormente, puede activar las relaciones de eliminación en cascada configuradas en la base de datos.

---

# Recordatorios

Los recordatorios se configuran mediante:

```text
reminder_days_before
```

La fecha/hora lógica del recordatorio se deriva de la fecha de vencimiento:

```text
due_date - reminder_days_before
```

En el MVP no existe una tabla persistente de `reminders`.

La primera versión puede calcular qué compromisos requieren notificación y posteriormente enviar la notificación correspondiente.

Una futura versión puede incorporar historial de notificaciones para almacenar estados como:

```text
SCHEDULED
SENT
FAILED
RETRYING
```

---

# Módulos del backend

La arquitectura estará organizada por dominio.

Estructura conceptual:

```text
src/
├── modules/
│   ├── profiles/
│   ├── categories/
│   ├── commitments/
│   ├── occurrences/
│   ├── payments/
│   └── reminders/
│
├── shared/
│   ├── database/
│   ├── errors/
│   ├── middleware/
│   └── ...
│
├── config/
└── app.ts
```

La estructura final puede evolucionar si existe una justificación arquitectónica.

---

# Responsabilidades por capa

## Route

Define:

- Endpoint.
- HTTP method.
- Middleware.
- Controller correspondiente.

## Controller

Responsable de:

- Recibir la petición.
- Extraer parámetros.
- Invocar el caso de uso/service.
- Construir la respuesta HTTP.

No debe contener reglas de negocio.

## Service / Use Case

Responsable de:

- Reglas de negocio.
- Orquestación.
- Validaciones de negocio.
- Transacciones.
- Coordinación entre repositorios.

## Repository

Responsable de:

- Acceso a PostgreSQL mediante Prisma.
- Queries.
- Persistencia.

No debe contener reglas de negocio.

## Validation

Zod será utilizado para validar los límites de entrada:

- Body.
- Params.
- Query parameters.

TypeScript por sí solo no sustituye la validación de datos provenientes del cliente.

---

# Transacciones

Las operaciones que modifiquen varias entidades relacionadas deben evaluarse para determinar si requieren una transacción.

Por ejemplo, registrar un pago puede implicar:

```text
1. Crear payment.
2. Cambiar occurrence.status → PAID.
3. Determinar el siguiente vencimiento.
4. Actualizar financial_commitment.next_due_date.
5. Crear la siguiente occurrence cuando corresponda.
```

Estas operaciones deben tratarse como una unidad lógica cuando su consistencia dependa entre sí.

---

# Estado de implementación

| Módulo | Estado | Responsabilidad |
|---|---|---|
| Foundation | ✓ Completo | Configuración, Prisma, errores, middleware y validación |
| Autenticación | ✓ Completo | Integración con Supabase Auth (requireAuth, optionalAuth) |
| Perfil | ✓ Completo | Perfil local, onboarding automático y soft delete |
| Categorías | ✓ Completo | Gestión de categorías (CRUD completo) |
| Compromisos | ✓ Completo | CRUD commitments, validación ownership, cálculo automático nextDueDate |
| Recurrencia | ✓ Completo | Cálculo de próximos vencimientos (5 frecuencias: BIWEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY) |
| Ocurrencias | ✓ Completo | Generación lazy, listado, obtención por ID, validación ownership |
| Pagos | ✓ Completo | Registro transaccional de pagos, actualización automática nextDueDate |
| Recordatorios | ✓ Completo | Cálculo on-demand + scheduler opcional (deshabilitado por defecto) |
| Autenticación Social | ✓ Completo | OAuth via Supabase (Google, Apple) — frontend llama signInWithOAuth() |

---

# Orden de trabajo

La implementación debe realizarse incrementalmente y **un servicio/módulo a la vez**.

## Fase 1 — Foundation

1. Revisar estructura actual del backend.
2. Prisma Client.
3. Configuración.
4. Database client.
5. Manejo global de errores.
6. Middleware de autenticación.
7. Validación con Zod.

## Fase 2 — Perfil

8. Profile service.
9. Completar contrato entre backend y cliente móvil.
10. Completar onboarding.
11. Pruebas de autenticación y autorización.

## Fase 3 — Catálogos

12. Category service.
13. Endpoints para consulta/gestión de categorías.

## Fase 4 — Dominio financiero

14. Financial Commitment service.
15. Recurrence service.
16. Occurrence service.
17. Generación y consulta de próximos vencimientos.

## Fase 5 — Pagos

18. Payment service.
19. Registro de pagos.
20. Actualización transaccional de ocurrencias.
21. Actualización de `next_due_date`.
22. Historial de pagos.

## Fase 6 — Recordatorios

23. Reminder calculation/service.
24. Estrategia de ejecución.
25. Integración con notificaciones.

## Fase 7 — Autenticación social

26. Google Sign-In.
27. Sign in with Apple.

## Fase 8 — Calidad

28. Pruebas unitarias.
29. Pruebas de integración.
30. Pruebas de autorización/ownership.
31. Revisión de contratos móvil/backend.
32. Actualización de documentación.

---

# Regla de desarrollo incremental

No implementar todo el backend de una sola vez.

Para cada módulo se debe seguir este proceso:

### 1. Objetivo

Definir qué vamos a construir.

### 2. Responsabilidad

Definir qué hace y qué no hace el módulo.

### 3. Diseño

Definir entidades, relaciones y flujo.

### 4. Casos de uso

Identificar las operaciones necesarias.

### 5. Reglas de negocio

Definir las condiciones que deben cumplirse.

### 6. Persistencia

Definir las operaciones necesarias mediante Prisma/PostgreSQL.

### 7. Errores

Definir errores de validación, autorización, conflictos y negocio.

### 8. Estructura

Definir archivos y módulos que serán creados o modificados.

### 9. Implementación

Implementar únicamente después de revisar el diseño.

### 10. Verificación

Definir cómo probar el módulo y sus casos principales.

Después de cada módulo se debe detener el desarrollo y verificar que el comportamiento sea correcto antes de avanzar.

---

# Decisiones arquitectónicas consolidadas

Las siguientes decisiones forman parte del diseño actual y no deben modificarse sin justificar previamente la necesidad:

- Una única entidad `financial_commitments` para deudas y obligaciones.
- `type` diferencia `DEBT` y `OBLIGATION`.
- No existen tablas específicas para Netflix, arriendos, préstamos, servicios, etc.
- Un usuario puede crear múltiples compromisos de cualquier categoría.
- `occurrences` representa los vencimientos concretos.
- `payments` representa los pagos realizados.
- Una ocurrencia puede tener como máximo un pago en el MVP.
- No existen pagos parciales.
- `OVERDUE` es derivado y no persistido.
- No se generan indefinidamente todos los vencimientos futuros.
- La recurrencia pertenece al backend.
- No se utilizará un motor genérico RRULE/cron para la recurrencia del MVP.
- `next_due_date` es estado operacional/denormalizado.
- `default_amount` es un monto esperado/de referencia.
- `paid_amount` representa el monto efectivamente pagado y es opcional.
- Se utiliza soft delete únicamente para el perfil mediante `deleted_at`.
- Supabase Auth administra la identidad.
- PostgreSQL almacena los datos de negocio.
- Prisma es la capa ORM.
- UUID es el identificador principal de las entidades.
- `DATE` se utiliza para fechas de calendario.
- `TIMESTAMPTZ` se utiliza para timestamps.
- `NUMERIC(14,2)` se utiliza para valores monetarios.
- La lógica de negocio permanece en el backend.
- Las operaciones que requieran consistencia entre múltiples entidades deben utilizar transacciones.

---

# Próximos pasos

## Frontend (Inmediato — Bloqueante)

- Construir login.tsx y signup.tsx con react-hook-form + Zod
- Implementar selector real para gender en onboarding
- Crear bucket avatars en Supabase Storage con RLS
- End-to-end testing: signup → email verification → login → onboarding → app access

## Fase 8 — Calidad (Testing)

- Unit tests para authentication, validation
- Integration tests para Commitments, Occurrences, Payments
- Authorization/ownership tests
- E2E testing del flujo completo

## Futuro

- Integración de push notifications (usar scheduler de reminders)
- Optimizaciones de escala
- Reportes y analítica

---

# Log de decisiones

## 2026-09-17 (Primera sesión)

**Completado:**
- ✓ Financial Commitment Service (CRUD, validación ownership)
- ✓ Recurrence Service (extracción a servicio independiente, 5 frecuencias)
- ✓ Occurrence Service (módulo separado, generación lazy)
- ✓ Payment Service (transaccional, actualización automática nextDueDate)

**Cambios estructurales:**
- Occurrences movido de commitments/ a módulo separado independiente
- Payments como módulo propio (no acoplado a commitments)
- Recurrence como servicio puro (reutilizable)

**Endpoints disponibles (Fase 4-5):**
- Financial Commitments: GET /api/commitments, GET /api/commitments/:id, POST, PATCH, DELETE
- Occurrences: GET /api/occurrences/commitment/:commitmentId, GET /api/occurrences/:id, POST .../generate, PATCH .../mark-paid
- Payments: GET /api/payments/commitment/:commitmentId, GET /api/payments/:id, POST /api/payments

## 2026-09-17 (Segunda sesión)

**Completado:**
- ✓ Fase 6 — Reminders Service (cálculo on-demand + scheduler con node-cron)
- ✓ Fase 7 — Autenticación Social (OAuth via Supabase, GET /api/auth/providers)

**Arquitectura Recordatorios:**
- `reminders.service.ts`: Cálculo puro (daysUntilDue vs reminderDaysBefore)
- `reminders.scheduler.ts`: Cron job diario (deshabilitado por defecto, activar con REMINDERS_SCHEDULER_ENABLED=true)
- `GET /api/reminders`: Endpoint para consulta on-demand
- TODO: Integrar con notificaciones push cuando el scheduler se active

**Arquitectura OAuth:**
- Supabase Auth maneja todo (Google, Apple, Email/Password)
- Frontend llama `signInWithOAuth('google'|'apple')`
- Backend valida token con middleware existente (mismo para todas las auth methods)
- `GET /api/auth/providers`: Descubrimiento de proveedores disponibles
- Configuración real de OAuth en consola de Supabase (solo necesita app IDs y redirect URIs)

**Próximo:**
- Frontend: Login/Signup screens (inmediato/bloqueante)
- O: Testing (Fase 8)