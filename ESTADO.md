# Legends Tracker — Estado del proyecto



Última actualización: junio 2026



## ✅ Funciona ahora



- Crear carrera y subir capturas reales (IA OpenAI)

- Procesar → Temporada 1, 2, 3… (sin años de calendario)

- Reemplazar temporada existente o crear nueva

- Eliminar temporada o carrera completa

- El Periódico con crónica por temporada

- **Total Histórico**: crónica cruzada + evolución del plantel

- Muro de Leyendas con rankings acumulados

- Evolución en Muro: subidas, bajadas, estrellas, continuidad

- Historia Real (Pro): selector País → Liga → Club + 330+ récords

- Onboarding en Carga

- Vista móvil adaptada

- Guardado en localStorage

- **Login + nube** (Supabase): sync automática entre dispositivos



## 🔄 Pro real (Stripe) — implementado, falta configurar



- Checkout Stripe 1,99€/mes

- Webhook → tabla `user_subscriptions` en Supabase

- Portal de facturación (cancelar / tarjeta)

- **Pendiente en tu `.env`:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`



## 🚀 Cómo arrancar



```powershell

cd "C:\Users\nicom\OneDrive\Desktop\FL"

npm run dev

```



- Web: http://localhost:5173

- API: http://localhost:3001



## 🔜 Publicar online

Guía paso a paso en **`PUBLICAR.md`** (Vercel web + Render API)

