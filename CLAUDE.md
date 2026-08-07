# [Nombre de la App] — CLAUDE.md

## Contexto del proyecto

Este proyecto tiene como objetivo el desarrollo de una aplicación móvil (iOS y Android)
construida con **React Native + Expo** (usando EAS Build/Submit para compilación y
publicación en tiendas). El backend se construye con **Node.js + Express + TypeScript**,
usando **Prisma** como ORM sobre una base de datos **PostgreSQL** (hosteada en Neon o
Railway durante el MVP, con posibilidad de migrar a AWS RDS al escalar). Para
autenticación usa **Supabase Auth** en lugar de construirla desde cero.
El backend se desplegará en **Railway o Render** para simplicidad inicial, migrando a
**AWS App Runner/ECS Fargate** si el proyecto requiere más control o escala.

El desarrollador tiene experiencia sólida en React, TypeScript, Next.js, Node/Express,
Redux, Tailwind, Zod, Docker y PostgreSQL, por lo que el stack elegido busca maximizar
el uso de este conocimiento existente y minimizar la curva de aprendizaje, incorporando
solo herramientas nuevas donde realmente aportan valor (auth gestionada, y el proceso
de build/submit nativo específico de mobile).

El nicho de negocio que se está evaluand

A lo largo de este proyecto se irán definiendo requerimientos, arquitectura, pantallas
y decisiones técnicas de forma incremental, conversación por conversación. Este archivo
debe actualizarse con cada avance significativo para mantener contexto trazable.

---

## Stack técnico

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Base de datos:** PostgreSQL (Neon/Railway en MVP → AWS RDS al escalar)
- **Auth:** Supabase Auth
- **Deploy backend:** Railway o Render (MVP) → AWS App Runner/ECS Fargate (escala)
- **Deploy mobile:** EAS Build/Submit (Expo) → App Store Connect / Google Play Console
- **Validación:** Zod (frontend + backend)

---

## Estado actual

- [ ] Definición de MVP y funcionalidad core
- [ ] Selección de nicho definitivo
- [x] Setup de repositorio backend y entorno (estructura de carpetas + config inicial)
- [x] Entorno local de ejecución configurado (Node 22 + `tsx` + Prisma Client v7)
- [x] Configuración de base de datos y esquema inicial (Prisma)
- [x] Configuración de autenticación con Supabase Auth
- [x] Primer módulo de dominio: perfiles de usuario
- [ ] Diseño de pantallas core (wireframes)

---

## Decisiones técnicas (log)

### [Fecha]
- Decisión: Stack definido — React Native/Expo + Node/Express + PostgreSQL
- Razón: Maximiza reutilización de conocimiento existente del desarrollador, minimiza
  curva de aprendizaje

### 2026-08-02
- Decisión: Auth definitivo — **Supabase Auth** (se descarta Clerk por ahora)
- Decisión: Estructura de carpetas del backend organizada **por módulo/dominio**
  (no por tipo de archivo), con capas controller → service → routes dentro de cada
  módulo. Ver sección "Estructura del backend" abajo.
- Decisión: Middleware de auth (`requireAuth` / `optionalAuth`) valida el JWT de
  Supabase contra el servidor (`supabaseAdmin.auth.getUser(token)`), no localmente.
- Archivos creados: `src/config/env.ts`, `src/config/database.ts`,
  `src/config/supabase.ts`, `src/middlewares/auth.middleware.ts`,
  `src/middlewares/error.middleware.ts`, `src/lib/errors.ts`, `src/lib/logger.ts`,
  `src/routes/index.ts`, `src/app.ts`, `src/server.ts`, `.env.example`
- Pendiente: aún no se ha definido el nicho, por lo que no existen módulos de dominio
  todavía (solo el módulo `users` está reservado en la estructura, sin implementar)

### 2026-08-03
- Decisión: Desarrollo local con Node.js 22 (definido en `.nvmrc`) y `tsx` para ejecutar
  TypeScript ESM. Prisma 7 usa el cliente generado en `src/generated/prisma` junto al
  adaptador `@prisma/adapter-pg` para PostgreSQL.
- Decisión: La identidad (email, contraseña, sesión y JWT) se administra en Supabase
  Auth. La información propia de la aplicación se almacena en el modelo local `Profile`.
  La base de datos local y Supabase Auth son sistemas distintos; por tanto, el perfil no
  se crea mediante un trigger de Supabase.
- Decisión: La app móvil registra e inicia sesión directamente con Supabase mediante la
  publishable key. Después de obtener una sesión, llama al backend con el `access_token`
  como `Authorization: Bearer <token>` para crear o actualizar su perfil.
- Implementado: Modelo `Profile` con migración inicial, enum `Gender` y cliente Prisma
  regenerado. El usuario usa el mismo UUID de Supabase Auth como clave primaria del perfil.
- Implementado: `POST /api/users/profile`, `GET /api/users/profile` y
  `PATCH /api/users/profile`, todos protegidos con `requireAuth`. El POST crea o completa
  el perfil inicial con `upsert`; el PATCH actualiza únicamente los campos enviados y no
  crea perfiles. Ambos toman el UUID exclusivamente del JWT; nunca del body de la petición.
- Implementado: `DELETE /api/users/profile` realiza soft delete: registra la fecha en
  `Profile.deletedAt` sin borrar la fila. Los perfiles eliminados no se devuelven en
  lecturas ni pueden reactivarse con el endpoint de upsert.
- Decisión: El soft delete actual afecta únicamente el perfil de la aplicación. La
  identidad y sesión de Supabase Auth no se eliminan automáticamente; la app debe cerrar
  sesión después de la operación. El cierre definitivo o restauración de una cuenta se
  definirá como un flujo administrativo separado.
- Configuración: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `SUPABASE_PUBLISHABLE_KEY` deben
  pertenecer al mismo proyecto. Tras cambiar `.env`, se debe reiniciar el servidor porque
  las variables se leen al arranque.
- Implementado: CI en GitHub Actions (`.github/workflows/ci.yml`) para pushes y pull
  requests a `main`. Instala dependencias con `npm ci`, genera Prisma Client, ejecuta
  lint, typecheck, build, migraciones en PostgreSQL 16 temporal y tests.
- Decisión: La calidad local se ejecuta con `npm run lint`, `npm run typecheck`,
  `npm run build` y `npm test`. TypeScript se fija en la rama estable 5.9 para mantener
  compatibilidad con el parser de ESLint para TypeScript.

---

## Estructura del backend

```
backend/
├── src/
│   ├── config/          # env.ts, database.ts (Prisma), supabase.ts
│   ├── modules/         # un folder por dominio (users, y los que se definan luego)
│   │   └── [modulo]/
│   │       ├── *.controller.ts
│   │       ├── *.service.ts
│   │       ├── *.routes.ts
│   │       ├── *.schema.ts   (Zod)
│   │       └── *.types.ts
│   ├── middlewares/     # auth.middleware.ts, error.middleware.ts
│   ├── lib/              # errors.ts, logger.ts
│   ├── routes/index.ts   # agrega todos los módulos bajo /api
│   ├── app.ts             # configuración de Express
│   └── server.ts          # entry point
├── prisma/schema.prisma
├── tests/
└── .env.example
```

---

## Flujo de perfil autenticado

1. La app Expo ejecuta `supabase.auth.signUp()` o `signInWithPassword()`.
2. Supabase Auth devuelve una sesión con `access_token`.
3. La app llama `POST /api/users/profile` con el token Bearer y los datos de perfil.
4. `requireAuth` valida el token con Supabase y añade `req.user`.
5. El servicio ejecuta `upsert` en PostgreSQL local con `req.user.id`.

Body permitido para `POST /api/users/profile`:
`fullName`, `gender`, `country` (ISO de dos letras), `phone`, `avatarUrl` y
`notificationsEnabled`.

`PATCH /api/users/profile` acepta el mismo body de forma parcial, pero requiere al menos
un campo válido y no admite campos desconocidos.

`DELETE /api/users/profile` no recibe ID en el body: obtiene el ID del JWT y responde
`204 No Content` si elimina el perfil, `404` si no existe o `409` si ya fue eliminado.

---

## Próximos pasos

- Definir el nicho específico y la funcionalidad core del MVP
- Probar `POST /api/users/profile` end-to-end con un `access_token` vigente de Supabase
- Diseñar los siguientes módulos de dominio y sus esquemas Prisma
- Añadir pruebas automatizadas para autenticación, validación y perfiles
- Ampliar la suite de pruebas de integración contra PostgreSQL de CI
