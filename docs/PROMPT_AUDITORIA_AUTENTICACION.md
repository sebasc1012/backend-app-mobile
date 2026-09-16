# Prompt: auditoría de autenticación móvil y backend

```text
Actúa como arquitecto senior de React Native/Expo y Node.js/Express, con foco en seguridad de autenticación y experiencia móvil. Audita el estado actual de la autenticación entre estos dos repositorios, sin modificar código, dependencias, configuración ni secretos:

- Backend: /Users/sebasc1210/Documents/App/backend
- App móvil: /Users/sebasc1210/Documents/App/mobile-app

Contexto técnico confirmado:
- Móvil: React Native + Expo Router + TypeScript + Supabase JS + Expo SecureStore + Axios + TanStack Query.
- Backend: Node.js + Express + TypeScript + Prisma/PostgreSQL.
- Identidad, sesión y JWT: Supabase Auth.
- El móvil debe enviar el access_token como `Authorization: Bearer <token>`; el backend lo valida con Supabase antes de acceder al perfil local.
- El perfil local usa el mismo UUID del usuario de Supabase.
- Aún no existe un nicho definido; evalúa el flujo como base reutilizable para un MVP.

Primero, lee las instrucciones de cada repo (CLAUDE.md, AGENTS.md y README) y revisa el grafo del código con CodeGraph si está disponible. Después, inspecciona el código real y cita cada hallazgo con ruta y línea. No supongas que un flujo está implementado si no encuentras evidencia.

Evalúa, como mínimo:

1. Sesión móvil
   - Inicialización de Supabase, persistencia en SecureStore, refresco de token, carga inicial y suscripción a cambios de auth.
   - Registro, confirmación de correo, inicio y cierre de sesión.
   - Protección y redirecciones de rutas Expo Router, incluida la primera apertura de la app.
   - Manejo de estados de carga, errores de red y expiración o revocación de sesión.

2. Comunicación móvil-backend
   - Inyección del Bearer token en Axios.
   - Consistencia exacta de los contratos HTTP: método, URL, body, status y forma de respuesta.
   - Lectura, creación, actualización y eliminación lógica del perfil.
   - Onboarding: qué condición lo inicia, cómo se completa y qué sucede si se omite.

3. Backend
   - Validación del JWT y ausencia de confianza en IDs enviados por el cliente.
   - Validación Zod, autorización, manejo de errores y CORS.
   - Esquema Prisma, soft delete y consistencia con Supabase Auth.
   - Riesgos de seguridad, secretos, exposición de datos y comportamientos ante token inválido.

4. Calidad y cobertura
   - Pruebas existentes y flujos críticos sin pruebas.
   - Configuración de lint, typecheck, build y CI en ambos repositorios.
   - Documentación existente y los datos que faltan para que alguien nuevo pueda ejecutar y verificar auth.

Entrega el resultado en español con esta estructura fija:

## Resumen ejecutivo
Indica el nivel de preparación: bloqueado, prototipo, funcional con riesgos o listo para MVP. Resume el recorrido actual de usuario en 4–7 pasos.

## Matriz de estado
Una tabla con: área, estado (implementado/parcial/ausente), evidencia, impacto y siguiente acción.

## Hallazgos priorizados
Lista hallazgos P0–P3. Para cada uno incluye causa, consecuencia, evidencia ruta:línea y propuesta concreta. Separa defectos confirmados de mejoras recomendadas.

## Contrato de integración
Tabla de endpoints de auth/perfil: método, ruta, autenticación, request esperado, respuesta real y consumidor móvil. Expón incompatibilidades.

## Escenarios E2E
Checklist verificable para: registro sin confirmación, registro con confirmación, login, reinicio de app con sesión, token inválido/expirado, usuario sin perfil, onboarding completo, onboarding omitido, logout y perfil eliminado.

## Plan de trabajo
Propón tareas pequeñas ordenadas por prioridad, con criterio de aceptación y qué repo toca cada una. No implementes nada hasta que se apruebe el plan.

## Propuesta de README
Enumera las secciones y comandos que deben añadirse o corregirse en cada README. No escribas secretos ni valores reales de `.env`.

Reglas:
- No expongas tokens, claves ni contenido de `.env`.
- No alteres archivos; esta es una auditoría de solo lectura.
- Distingue explícitamente entre evidencia y suposiciones.
- Si una prueba no puede ejecutarse, explica por qué y da el comando para ejecutarla localmente.
```
