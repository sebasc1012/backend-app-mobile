# Finanzas al Día — Contexto del backend

## Propósito del producto

**Finanzas al Día** es una aplicación móvil para organizar obligaciones financieras
recurrentes —arriendo, servicios, suscripciones o cuotas—, conocer su vencimiento y
recibir recordatorios para pagarlas a tiempo.

No es una aplicación de procesamiento de pagos en esta etapa: no integraremos Apple
Pay ni Google Pay. Apple y Google se incorporarán como proveedores de **inicio de
sesión social** mediante Supabase Auth.

## MVP definido

1. Crear una cuenta o iniciar sesión con email/contraseña, Google o Apple.
2. Registrar y gestionar recordatorios de pagos recurrentes.
3. Consultar monto, fecha de vencimiento, categoría y estado de cada obligación.
4. Recibir recordatorios antes del vencimiento y marcar un pago como realizado.

Fuera del MVP: procesamiento de pagos, conexión bancaria automática, presupuestos
complejos, inversiones, préstamos y reportes financieros avanzados.

## Stack técnico

- **Móvil:** React Native + Expo + Expo Router + TypeScript.
- **Backend:** Node.js 22 + Express 5 + TypeScript.
- **Datos:** PostgreSQL + Prisma 7.
- **Identidad:** Supabase Auth (email/contraseña, Google y Apple).
- **Validación:** Zod en cliente y servidor.
- **Datos remotos móvil:** Axios + TanStack Query.
- **Sesión móvil:** Supabase JS + Expo SecureStore.
- **Entrega:** EAS Build/Submit para móvil; Railway o Render para el backend inicial.

## Principios de implementación

- Aplicar SOLID y Clean Code: responsabilidades explícitas, funciones pequeñas y
  errores de dominio consistentes.
- Organizar el backend por módulos de dominio, no por tipo de archivo global.
- Mantener `route -> controller -> service -> repository/Prisma` cuando el módulo
  lo requiera; Zod valida los límites de entrada.
- No mezclar identidad de Supabase con datos de negocio. El UUID del JWT es la
  identidad de referencia del perfil y de los recursos del usuario.
- Todo recurso financiero debe estar aislado por usuario autenticado; ningún ID de
  propietario procede del body de la petición.

## Módulos y estado

| Módulo | Estado | Responsabilidad |
|---|---|---|
| `users` / perfil | Parcial | Perfil local asociado a Supabase Auth |
| autenticación | Parcial | Email/contraseña implementado; Google y Apple pendientes |
| obligaciones financieras | Pendiente | Pagos recurrentes, monto, categoría y vencimiento |
| recordatorios | Pendiente | Programación, entrega y estado de avisos |
| pagos registrados | Pendiente | Marcar obligaciones como pagadas e historial |

## Flujo de autenticación

1. La app usa Supabase para email/contraseña; después usará OAuth de Google y
   Sign in with Apple.
2. Supabase entrega una sesión con `access_token`.
3. La app llama al backend con `Authorization: Bearer <token>`.
4. `requireAuth` valida el token mediante `supabaseAdmin.auth.getUser(token)` y
   adjunta `req.user`.
5. El backend crea o actualiza el `Profile` usando solo `req.user.id`.

Para Google y Apple se deberá configurar cada proveedor en Supabase, los redirect
URLs/deep links de Expo y las credenciales nativas. No implementar estos proveedores
como mecanismos de pago.

## Estado técnico actual

- [x] Estructura base del backend, Prisma y PostgreSQL.
- [x] Supabase Auth con verificación remota de JWT.
- [x] Perfil local, validación Zod y soft delete.
- [x] CI: lint, typecheck, build, migraciones y pruebas.
- [ ] Contrato de perfil consistente con el cliente móvil.
- [ ] Estado persistente de onboarding completado u omitido.
- [ ] Login con Google y Apple.
- [ ] Módulos de obligaciones, pagos y recordatorios.
- [ ] Pruebas de autenticación y autorización más allá de health.

## Limitaciones conocidas

- `GET /api/users/profile` responde `{ profile }`, mientras el cliente actual espera
  el perfil directamente. Debe unificarse el contrato.
- El modelo tiene `onboardingCompleted`, pero el endpoint actual no permite marcarlo.
- El soft delete elimina solo el perfil local; no borra el usuario de Supabase ni
  cierra su sesión.

## Próximo orden de trabajo

1. Corregir el contrato de perfil y finalizar onboarding.
2. Diseñar e implementar login con Google y Apple.
3. Diseñar el módulo de obligaciones financieras recurrentes.
4. Diseñar recordatorios y la estrategia de notificaciones.
5. Añadir pruebas de integración y actualizar este archivo tras cada hito.
