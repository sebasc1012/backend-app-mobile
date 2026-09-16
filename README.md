# Finanzas al Día — Backend

API para **Finanzas al Día**, una aplicación móvil que organiza pagos recurrentes y
recuerda sus vencimientos. Gestiona perfiles y, en las siguientes fases, obligaciones
financieras, recordatorios e historial de pagos. Supabase Auth es la fuente de
identidad, sesiones y JWT.

## MVP

El MVP permitirá autenticar usuarios, registrar obligaciones mensuales, consultar
próximos vencimientos, recibir recordatorios y marcar pagos como realizados. No
procesará dinero: Apple Pay y Google Pay están fuera del alcance. Apple y Google se
integrarán como proveedores de inicio de sesión social mediante Supabase Auth.

## Stack

- Node.js 22, Express 5 y TypeScript
- Prisma 7 y PostgreSQL
- Supabase Auth
- Zod para validación

## Arquitectura y módulos

El backend se organiza por dominio y aplica SOLID y Clean Code. Cada módulo mantiene
sus rutas, controlador, servicio, schema Zod y tipos; la lógica de negocio no vive en
las rutas ni confía en IDs enviados por el cliente.

| Módulo | Estado |
|---|---|
| Perfil de usuario | Parcialmente implementado |
| Email/contraseña con Supabase | Implementado |
| Google Sign-In y Sign in with Apple | Pendiente |
| Obligaciones financieras recurrentes | Pendiente |
| Recordatorios y pagos realizados | Pendiente |

## Arquitectura de autenticación

La app móvil registra e inicia sesión directamente contra Supabase. Cuando tiene
una sesión, envía su `access_token` en `Authorization: Bearer <token>` al backend.
El middleware `requireAuth` valida el token con Supabase y obtiene el UUID del
usuario desde el JWT; los endpoints nunca aceptan ese UUID en el body.

El modelo `Profile` de PostgreSQL conserva datos propios de la aplicación. Su
clave primaria es el mismo UUID que asigna Supabase Auth. El borrado de perfil
es lógico: marca `deletedAt` y no elimina la identidad ni la sesión de Supabase.

El siguiente alcance de autenticación es habilitar Google Sign-In y Sign in with
Apple mediante Supabase Auth. Son proveedores de login; no son Apple Pay ni Google Pay.

## Requisitos

- Node.js 22 o posterior
- PostgreSQL accesible
- Un proyecto Supabase

## Configuración local

1. Instala dependencias:

   ```bash
   npm ci
   ```

2. Crea `.env` a partir de este esquema (usa valores reales solo en tu máquina):

   ```dotenv
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   SUPABASE_URL=https://PROJECT.supabase.co
   SUPABASE_SECRET_KEY=your_supabase_secret_key
   SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   CORS_ORIGIN=http://localhost:8081
   ```

   `SUPABASE_SECRET_KEY` es exclusiva del backend. No la copies al repositorio,
   la app móvil ni variables `EXPO_PUBLIC_*`.

3. Genera el cliente Prisma y aplica las migraciones:

   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

La API queda disponible bajo `http://localhost:3000/api`.

## Endpoints actuales

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Estado del servicio |
| GET | `/api/me` | Bearer | Usuario validado desde el JWT |
| GET | `/api/users/profile` | Bearer | Consulta el perfil actual |
| POST | `/api/users/profile` | Bearer | Crea o completa el perfil actual |
| PATCH | `/api/users/profile` | Bearer | Actualiza campos del perfil actual |
| DELETE | `/api/users/profile` | Bearer | Realiza soft delete del perfil |

Los campos aceptados para crear o actualizar un perfil son `fullName`, `gender`,
`country` (ISO de dos letras), `phone`, `avatarUrl` y `notificationsEnabled`.
`PATCH` exige al menos un campo y no admite propiedades desconocidas.

Actualmente, las respuestas de lectura y escritura de perfil usan el envoltorio
`{ "profile": { ... } }`.

## Calidad y CI

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

GitHub Actions ejecuta esos pasos contra PostgreSQL 16 para pushes y pull requests
en `main` y `develop`.

## Limitaciones conocidas

- El cliente móvil actual interpreta `GET /api/users/profile` como si devolviera
  el perfil directamente, mientras esta API devuelve `{ profile }`. El contrato
  debe unificarse antes de considerar el onboarding funcional.
- `onboardingCompleted` existe en el modelo, pero no forma parte del payload de
  perfil actual. No hay una operación que marque explícitamente el onboarding
  como completado u omitido.
- El backend solo dispone de una prueba de health. Faltan pruebas para JWT,
  autorización, validación, perfiles y borrado lógico.
- El borrado del perfil no elimina el usuario de Supabase ni cierra su sesión;
  un cierre o borrado definitivo de cuenta requiere un flujo separado.

## Próximos pasos

1. Acordar el contrato único de respuestas de perfil con el cliente móvil.
2. Definir y persistir la transición de onboarding completado/omitido.
3. Implementar Google Sign-In y Sign in with Apple con Supabase.
4. Diseñar el módulo de obligaciones financieras recurrentes.
5. Diseñar recordatorios y el registro de pagos realizados.
6. Añadir pruebas de integración de autenticación y perfil.
