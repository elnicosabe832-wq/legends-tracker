# Publicar Legends Tracker online

**Arquitectura:** Vercel (web) + Render (API Express)

---

## Resumen

| Parte | Dónde | URL ejemplo |
|-------|--------|-------------|
| Web (React) | [Vercel](https://vercel.com) | `https://legends-tracker-five.vercel.app` |
| API (Node) | [Render](https://render.com) | `https://legends-tracker.onrender.com` |
| Auth / datos | Supabase | ya configurado |
| Pagos | Stripe | webhook en producción |

---

## Paso 1 — Subir el código a GitHub

Necesitas el proyecto en GitHub para Vercel y Render.

1. Instala [Git](https://git-scm.com/download/win) si no lo tienes
2. Crea un repo vacío en [github.com/new](https://github.com/new) (ej. `legends-tracker`)
3. En PowerShell:

```powershell
cd "C:\Users\nicom\OneDrive\Desktop\FL"
git init
git add .
git commit -m "Legends Tracker — listo para publicar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/legends-tracker.git
git push -u origin main
```

> **Importante:** `.env` no debe subirse (ya está en `.gitignore`). Las claves van en Vercel/Render.

---

## Paso 2 — API en Render

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Conecta tu repo de GitHub
3. Configuración:
   - **Name:** `legends-tracker-api`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (se “duerme” tras inactividad; primera carga ~30 s)
4. **Environment Variables** (copia desde tu `.env` local):

| Variable | Valor |
|----------|--------|
| `OPENAI_API_KEY` | sk-proj-... |
| `VITE_SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... (service_role) |
| `STRIPE_SECRET_KEY` | sk_test_... o sk_live_... |
| `STRIPE_PRICE_ID` | price_... |
| `STRIPE_WEBHOOK_SECRET` | *(Paso 4 — webhook producción)* |
| `APP_URL` | *(Paso 3 — URL de Vercel)* |
| `CORS_ORIGINS` | *(misma URL de Vercel)* |

5. **Create Web Service**
6. Copia la URL del servicio, ej. `https://legends-tracker.onrender.com`
7. Prueba: abre `https://TU-API.onrender.com/api/health` → debe decir `"ok": true`

---

## Paso 3 — Web en Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importa el repo
2. **Framework:** Vite (detectado automático)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables** (solo las públicas `VITE_`):

| Variable | Valor |
|----------|--------|
| `VITE_SUPABASE_URL` | https://xxx.supabase.co |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sb_publishable_... |
| `VITE_API_URL` | `https://legends-tracker.onrender.com` *(sin barra final)* |

6. **Deploy**
7. Copia tu URL, ej. `https://legends-tracker-five.vercel.app`

### Vuelve a Render y actualiza

En las variables de Render:

- `APP_URL` = `https://legends-tracker-five.vercel.app`
- `CORS_ORIGINS` = `https://legends-tracker-five.vercel.app`

Guarda → Render redeploy automático.

---

## Paso 4 — Stripe webhook (producción)

En local usabas `stripe listen`. En producción el webhook va directo a Render.

1. [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**
2. **URL:** `https://legends-tracker.onrender.com/api/stripe/webhook`
3. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Crea y copia el **Signing secret** (`whsec_...`)
5. Pégalo en Render → `STRIPE_WEBHOOK_SECRET`
6. En Stripe, actualiza el producto/checkout si cambias a **modo Live** más adelante

---

## Paso 5 — Comprobar todo

1. Abre tu URL de Vercel
2. **Entrar** con tu cuenta Supabase
3. Crea carrera y **Procesar** capturas (API en Render)
4. **Hacerse Pro** → pago Stripe → ★ PRO

---

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| Pantalla en blanco en rutas | `vercel.json` ya incluye rewrite SPA |
| Error CORS | `CORS_ORIGINS` en Render = URL exacta de Vercel |
| API lenta la 1ª vez | Plan free de Render “despierta” tras inactividad |
| Pro no activa online | Webhook Stripe apuntando a Render + `STRIPE_WEBHOOK_SECRET` |
| Procesar falla | `OPENAI_API_KEY` en Render, no en Vercel |

---

## Modo Live (cuando quieras cobrar de verdad)

1. Stripe → activar cuenta → modo **Live**
2. Claves `sk_live_...` y webhook live en Render
3. Producto/precio en modo live → nuevo `STRIPE_PRICE_ID`
