# Tenant demo — Camping Cala Sereno

- **Qué es**: camping ficticio de la demo comercial → `camp.logic2b.com`. Reset nocturno (Fase 10).
- **Nivel**: conmutable 1/3 en la demo (Fase 10).
- **Estado**: Fase 3 — D1 real creada, migrada y sembrada; Worker desplegado con la API pública y privada. Pendiente: DNS `camp` (AAAA `100::` proxied), config/theme/content en Fases 4 y 9.

## Usuarios del dashboard (seed)

Contraseña de todos: `calasereno` (solo demo — el hash scrypt vive en `accounts`; seed determinista, ADR 0005).

| Email | Rol |
|---|---|
| direccion@calasereno.example | owner |
| gerencia@calasereno.example | manager |
| recepcion@calasereno.example | reception |
| consulta@calasereno.example | readonly |

Login: `POST /api/auth/sign-in/email` con `{ email, password }` (cookie de sesión Better Auth). Rutas privadas bajo `/api/admin/*`.
