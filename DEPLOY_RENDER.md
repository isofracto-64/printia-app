# Despliegue en Render

Este proyecto esta preparado para desplegar:

- `printia-api`: API FastAPI.
- `printia-postgres`: base de datos PostgreSQL.
- `printia-web`: frontend React/Vite.

## 1. Subir el proyecto a GitHub

Crea un repositorio con la carpeta completa `project`, incluyendo:

- `backend/`
- `frontend/`
- `render.yaml`
- `.gitignore`

No subas archivos `.env`, `backend/.env`, `frontend/.env`, `backend/uploads/`, `backend/media/`, `frontend/dist/` ni carpetas `venv` o `node_modules`.

## 2. Crear el Blueprint en Render

1. Entra a Render.
2. Selecciona `New` y luego `Blueprint`.
3. Conecta el repositorio de GitHub.
4. Render detectara `render.yaml`.
5. Confirma la creacion de los tres recursos.

Render pedira los valores marcados como secretos o manuales.

## 3. Variables para `printia-api`

Render llena automaticamente:

- `DATABASE_URL`
- `SECRET_KEY`

Captura manualmente:

- `BACKEND_PUBLIC_URL`: URL final de la API, por ejemplo `https://printia-api.onrender.com`
- `CORS_ORIGINS`: URL final del frontend, por ejemplo `https://printia-web.onrender.com`
- `MAIL_USERNAME`: correo SMTP
- `MAIL_PASSWORD`: password/app password SMTP
- `MAIL_FROM`: nombre y correo remitente, por ejemplo `Printia <soporte@tudominio.com>`
- `KIOSK_DEFAULT_EMAIL`: correo del usuario kiosco
- `KIOSK_DEFAULT_PASSWORD`: password fuerte del usuario kiosco

Los demas valores ya tienen defaults seguros en `render.yaml`.

## 4. Variables para `printia-web`

Captura manualmente:

- `VITE_API_URL`: URL final de la API, por ejemplo `https://printia-api.onrender.com`
- `VITE_SUPPORT_EMAIL`: correo publico de soporte
- `VITE_SUPPORT_COLLABORATORS`: JSON con colaboradores, por ejemplo:

```json
[{"name":"Soporte","email":"soporte@tudominio.com"}]
```

Despues de cambiar variables `VITE_*`, redeploya el frontend porque Vite las incrusta durante el build.

## 5. Verificacion

Cuando termine el despliegue:

1. Abre `https://printia-api.onrender.com/healthz`.
2. Debe responder `{"status":"ok"}`.
3. Abre `https://printia-api.onrender.com/docs`.
4. Abre la URL del frontend.
5. Prueba registro, login, admin, mapa y carga de archivos.

## Notas

- Los archivos subidos por usuarios quedan en el filesystem del servicio. Para produccion real conviene moverlos a almacenamiento externo como S3, Cloudflare R2 o similar.
- La base de datos se crea desde cero en Render. Si necesitas migrar datos locales, exporta con `pg_dump` e importa en la base de datos de Render.
