# Fincho — Backend (CLAUDE.md)

API REST de Fincho: perfil, categorías, compromisos financieros, ocurrencias
(vencimientos), pagos y recordatorios. Node.js 22 + Express 5 + TypeScript + Prisma 7
sobre PostgreSQL; identidad con Supabase Auth.

**Fuente de verdad: la wiki** (`../App Mobile/wiki/`). Estado, decisiones y reglas
completas están allí; ver el `CLAUDE.md` de la raíz para las reglas de documentación.

- Arquitectura, reglas y contrato de perfil: `../App Mobile/wiki/concepts/arquitectura-backend.md`
- Modelo de datos: `../App Mobile/wiki/schema/DB squema.md`
- Reglas de negocio (recurrencia, `next_due_date`, vencidos, pagos): `../App Mobile/wiki/entities/reglas-negocio.md`
- Estado: `../App Mobile/wiki/concepts/estado-proyecto.md`

## Comandos

```bash
npm run dev              # tsx watch src/server.ts
npm run lint
npm run typecheck
npm test                 # Jest (ESM, --experimental-vm-modules)
npm run build            # tsup → dist/
npm run prisma:generate  # cliente en src/generated/prisma
```

Node 22 (`.nvmrc`). Reiniciar el servidor después de cambiar `.env`.

## Estructura

```
src/
├── config/        # env.ts, database.ts (Prisma + @prisma/adapter-pg), supabase.ts
├── modules/       # un folder por dominio: auth, users, categories, commitments,
│                  # occurrences, payments, reminders
│   └── <modulo>/  # *.routes.ts → *.controller.ts → *.service.ts, *.schema.ts (Zod), *.types.ts
├── middlewares/   # auth.middleware.ts (requireAuth/optionalAuth), error.middleware.ts
├── lib/           # errors.ts, logger.ts
├── routes/index.ts  # monta los módulos bajo /api
├── app.ts
└── server.ts
prisma/schema.prisma
tests/
```

## Reglas críticas

- El dueño de un recurso sale **siempre** de `req.user.id` (JWT validado contra Supabase). Nunca de un `userId` en body, query o params.
- Todo recurso por ID se valida por ownership antes de leerlo o modificarlo.
- Zod en todos los límites de entrada. Los controllers no tienen reglas de negocio; los services sí.
- Operaciones que modifican varias entidades (por ejemplo, registrar un pago) van en una transacción.
- La recurrencia y `next_due_date` se calculan en el backend; no hay triggers con lógica de negocio.
- `OVERDUE` es derivado, no se guarda. Máximo un pago por ocurrencia. Dinero en `NUMERIC(14,2)`.
- Soft delete solo en el perfil (`deleted_at`).
- No cambiar las decisiones consolidadas (ver la página de arquitectura) sin justificarlo antes.
- Desarrollo incremental: un módulo a la vez, con diseño revisado antes de implementar y verificación al final.
- Al tocar endpoints, actualizar la colección de Postman.
