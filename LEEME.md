# Legends Tracker — Guía rápida

Complemento web para **Modo Carrera** de EA Sports FC: sube capturas de estadísticas, genera crónicas y compara tu carrera con la historia del club.

## Paso 1: Instalar (solo la primera vez)

```powershell
cd "C:\Users\nicom\OneDrive\Desktop\FL"
npm install
```

## Paso 2: Clave OpenAI (para Procesar capturas)

1. Crea una clave en [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. En la carpeta `FL`, crea el archivo `.env`:

```
OPENAI_API_KEY=sk-tu-clave-aqui
```

3. Activa facturación en OpenAI si ves error 429 (cuota).

## Paso 2b: Supabase (login y guardado en la nube)

Opcional pero recomendado si quieres entrar con email y sincronizar carreras entre PC y móvil.

1. Crea un proyecto gratis en [supabase.com](https://supabase.com/dashboard)
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql` (tabla `user_saves` + permisos)
3. En **Authentication → Providers**, deja **Email** activado
4. (Recomendado para pruebas) En **Authentication → Settings**, desactiva **Confirm email** para entrar sin confirmar el correo
5. En **Settings → API**, copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable key** (pestaña *API Keys*) → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Si no hay publishable: pestaña *Legacy API Keys* → **anon public** → `VITE_SUPABASE_ANON_KEY`
6. Añádelas a tu `.env` (junto a OpenAI). Cada línea debe ser `NOMBRE=valor`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

7. Comprueba en terminal: `npm run verify:env` (debe decir ✓ Supabase responde)
8. **Reinicia** `npm run dev` después de guardar el `.env`

**Comportamiento:**
- Sin login: todo sigue en `localStorage` del navegador
- Con **Entrar** (header): descarga la nube, fusiona con lo local y auto-guarda cada ~1,2 s
- Badge ☁️ en el header: *Sincronizando* / *Guardado* / *Error*

## Paso 2c: Stripe (Pro real 1,99€/mes)

1. Cuenta en [dashboard.stripe.com](https://dashboard.stripe.com) (modo **Test**)
2. **Product catalog** → producto *Legends Tracker Pro* → **1,99 €/mes** → copia **Price ID** (`price_...`)
3. **Developers → API keys** → **Secret key** → `STRIPE_SECRET_KEY`
4. Supabase → **Settings → API** → **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
5. Ejecuta de nuevo `supabase/schema.sql` (tabla `user_subscriptions`)
6. En `.env`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
APP_URL=http://localhost:5173
```

7. Webhook local ([Stripe CLI](https://stripe.com/docs/stripe-cli)):

```powershell
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copia el `whsec_...` → `STRIPE_WEBHOOK_SECRET` y reinicia `npm run dev`.

**Pro:** Entrar → **Hacerse Pro** → Stripe → vuelves con ★ PRO. Tarjeta test: `4242 4242 4242 4242`.

## Paso 3: Arrancar

**Doble clic** en `INICIAR.bat` o en terminal:

```powershell
npm run dev
```

- Web: **http://localhost:5173**
- API (lectura de capturas): puerto **3001**

## Flujo de uso

1. **Crear carrera** → nombre de tu equipo
2. **Carga** → capturas de *Menú plantilla → Estadísticas* (todas las páginas)
3. **Procesar** → nueva temporada, o **Reemplazar** si te equivocaste
4. **El Periódico** → crónica; **Total Histórico** → evolución entre temporadas
5. **Muro** → rankings; **Historia Real** (Pro) → comparar con récords del club

## Pro (Stripe)

- **1,99€/mes** con pago real vía Stripe
- Requiere **iniciar sesión** (Supabase)
- Carreras ilimitadas + pestaña **Historia Real** en el Muro
- Tarjeta de prueba Stripe: `4242 4242 4242 4242`, cualquier fecha futura y CVC

## Parar el servidor

`Ctrl + C` en la terminal.

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| `node` no reconocido | Instala Node.js desde [nodejs.org](https://nodejs.org) |
| Error 401 API | Revisa `.env` con `OPENAI_API_KEY=sk-...` |
| Error 429 | Añade crédito en OpenAI Billing |
| Puerto 3001 ocupado | Cierra la terminal anterior o reinicia `INICIAR.bat` |
| Pantalla en blanco | Usa http://localhost:5173, no abras archivos sueltos |
| No aparece Entrar | Añade `VITE_SUPABASE_URL` y clave (publishable o anon) al `.env` y reinicia |
| Invalid API key | Usa **Publishable key** o **anon public** completa; ejecuta `npm run verify:env` |
| Error al sincronizar | Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase |
| Email no confirmado | Desactiva confirmación en Supabase Auth o revisa tu bandeja |
| Pro no se activa tras pagar | Configura `STRIPE_WEBHOOK_SECRET` y `stripe listen` en local |
| Falta SUPABASE_SERVICE_ROLE | Cópiala de Supabase → Settings → API (solo servidor) |
