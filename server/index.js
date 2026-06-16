import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { extractPlayersFromImages } from './extractStats.js';
import { mergePlayerLists } from './mergePlayers.js';
import {
  handleCreateCheckoutSession,
  handleCreatePortalSession,
  handleStripeWebhook,
  handleSubscriptionStatus,
  requireAuth,
  isStripeConfigured,
} from './stripeRoutes.js';
import { isSupabaseAdminConfigured } from './supabaseAdmin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

if (process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim().replace(/^["']|["']$/g, '');
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

function buildCorsOrigins() {
  const origins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, '');
  if (appUrl) origins.add(appUrl);
  for (const part of (process.env.CORS_ORIGINS || '').split(',')) {
    const trimmed = part.trim().replace(/\/$/, '');
    if (trimmed) origins.add(trimmed);
  }
  return [...origins];
}

const corsOrigins = buildCorsOrigins();

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS bloqueado para: ${origin}`));
  },
}));

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    stripe: isStripeConfigured,
    supabaseAdmin: isSupabaseAdminConfigured,
  });
});

app.get('/api/stripe/status', requireAuth, handleSubscriptionStatus);
app.post('/api/stripe/create-checkout-session', requireAuth, handleCreateCheckoutSession);
app.post('/api/stripe/create-portal-session', requireAuth, handleCreatePortalSession);

app.post('/api/process-screenshots', async (req, res) => {
  try {
    const { images, teamName } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message: 'Falta la clave OPENAI_API_KEY en el archivo .env',
      });
    }

    if (!images?.length) {
      return res.status(400).json({ error: 'NO_IMAGES', message: 'No se enviaron capturas' });
    }

    const batchSize = 2;
    const allPlayers = [];

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const players = await extractPlayersFromImages(batch, teamName || 'Equipo');
      allPlayers.push(players);
    }

    const players = mergePlayerLists(allPlayers);

    if (!players.length) {
      return res.status(422).json({
        error: 'NO_PLAYERS',
        message: 'No se detectaron jugadores en las capturas. Asegúrate de que se vea la tabla de Estadísticas.',
      });
    }

    res.json({ players, count: players.length });
  } catch (err) {
    console.error('Error procesando capturas:', err);

    let message = err?.message || 'Error al procesar las capturas';
    if (message.includes('Incorrect API key') || err?.status === 401) {
      message =
        'La clave de OpenAI no es válida. Crea una nueva en platform.openai.com/api-keys, ' +
        'pégala en el archivo .env (sin comillas ni espacios) y reinicia con npm run dev.';
    } else if (err?.status === 429 || message.includes('exceeded your current quota')) {
      message =
        'Tu cuenta de OpenAI no tiene crédito disponible. Entra en platform.openai.com/settings/billing ' +
        'y añade un método de pago.';
    }

    res.status(err?.status === 401 ? 401 : err?.status === 429 ? 429 : 500).json({
      error: 'PROCESS_FAILED',
      message,
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Legends Tracker en puerto ${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Falta OPENAI_API_KEY en .env');
  } else {
    const masked = process.env.OPENAI_API_KEY.slice(0, 7) + '...' + process.env.OPENAI_API_KEY.slice(-4);
    console.log(`✓ Clave OpenAI cargada (${masked})`);
  }
  if (isStripeConfigured) {
    console.log('✓ Stripe configurado (checkout Pro)');
  } else {
    console.warn('⚠️  Stripe no configurado — añade STRIPE_SECRET_KEY y STRIPE_PRICE_ID');
  }
  if (!isSupabaseAdminConfigured) {
    console.warn('⚠️  Falta SUPABASE_SERVICE_ROLE_KEY — webhooks Pro no guardarán estado');
  }
});
