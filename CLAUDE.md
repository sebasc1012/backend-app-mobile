# [Nombre de la App] — CLAUDE.md

## Contexto del proyecto

Este proyecto tiene como objetivo el desarrollo de una aplicación móvil (iOS y Android)
construida con **React Native + Expo** (usando EAS Build/Submit para compilación y
publicación en tiendas). El backend se construye con **Node.js + Express + TypeScript**,
usando **Prisma** como ORM sobre una base de datos **PostgreSQL** (hosteada en Neon o
Railway durante el MVP, con posibilidad de migrar a AWS RDS al escalar). Para
autenticación se usará **Clerk o Supabase Auth** en lugar de construirla desde cero.
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
- **Auth:** Clerk o Supabase Auth
- **Deploy backend:** Railway o Render (MVP) → AWS App Runner/ECS Fargate (escala)
- **Deploy mobile:** EAS Build/Submit (Expo) → App Store Connect / Google Play Console
- **Validación:** Zod (frontend + backend)

---

## Estado actual

- [ ] Definición de MVP y funcionalidad core
- [ ] Selección de nicho definitivo
- [x] Setup de repositorio backend y entorno (estructura de carpetas + config inicial)
- [x] Entorno local de ejecución configurado (Node 22 + `tsx` + Prisma Client v7)
- [ ] Configuración de base de datos y esquema inicial (Prisma)
- [x] Configuración de autenticación (middleware base con Supabase Auth listo, falta probar contra proyecto real de Supabase)
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

## Próximos pasos

- Definir el nicho específico y la funcionalidad core del MVP
- Crear proyecto en Supabase y probar `requireAuth` end-to-end con un token real
- Diseñar el `schema.prisma` inicial (depende del nicho)
- Implementar el primer módulo de dominio real siguiendo el patrón de `modules/users`
- Configurar `package.json` scripts (dev, build, start) y `tsconfig.json`
